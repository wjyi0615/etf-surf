"""Validate an authorized ETF CSV locally; never publish or infer classifications."""
import argparse
import csv
from datetime import date
import hashlib
import io
import json
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def normalize(text, code_column, name_column, as_of, source_url, existing):
    """Map explicitly selected columns, preserving identifiers and unknown fields."""
    if date.fromisoformat(as_of).isoformat() != as_of or as_of > date.today().isoformat():
        raise ValueError('기준일은 미래가 아닌 YYYY-MM-DD 날짜여야 합니다.')
    url = urlparse(source_url)
    if url.scheme != 'https' or not (url.hostname == 'krx.co.kr' or (url.hostname or '').endswith('.krx.co.kr')):
        raise ValueError('실제로 확보한 KRX 공식 출처의 HTTPS 주소를 입력하세요.')
    reader = csv.DictReader(io.StringIO(text))
    headers = reader.fieldnames or []
    if len(headers) != len(set(headers)) or code_column == name_column or not {code_column, name_column} <= set(headers):
        raise ValueError('헤더 중복 또는 종목코드/상품명 컬럼 지정 오류입니다.')
    records, seen = [], set()
    for line, row in enumerate(reader, 2):
        if None in row or any(value is None for value in row.values()):
            raise ValueError(f'{line}행: CSV 열 수가 일치하지 않습니다.')
        ticker, name = row[code_column].strip(), row[name_column].strip()
        # Accept alphanumeric short codes without fabricating lost leading zeros.
        if not re.fullmatch(r'[0-9A-Z]{6}', ticker) or ticker in seen or not name:
            raise ValueError(f'{line}행: 코드 형식/중복 또는 빈 상품명을 확인하세요.')
        seen.add(ticker)
        old = existing.get(ticker)
        records.append(dict(ticker=ticker, name=name, category=None, benchmark=None,
                            detailStatus='existing' if old else 'unavailable',
                            nameChanged=bool(old and old['name'] != name)))
    if not records:
        raise ValueError('상품 행이 없습니다. 기존 데이터는 변경하지 않습니다.')
    return dict(schema_version=1, publicationStatus='unreviewed', asOf=as_of,
                sourceUrl=source_url, checkedAt=date.today().isoformat(), funds=records,
                review=dict(count=len(records), matched=sum(r['detailStatus'] == 'existing' for r in records),
                            missingExisting=sorted(set(existing) - seen),
                            renamed=[r['ticker'] for r in records if r['nameChanged']]))


def main():
    """Inspect CSV headers first; write validated output only under ignored local storage."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', type=Path)
    parser.add_argument('--encoding', default='utf-8-sig', choices=['utf-8-sig', 'cp949'])
    parser.add_argument('--code-column')
    parser.add_argument('--name-column')
    parser.add_argument('--as-of')
    parser.add_argument('--source-url')
    args = parser.parse_args()
    try:
        raw = args.csv.read_bytes()
        text = raw.decode(args.encoding)
        if not all([args.code_column, args.name_column, args.as_of, args.source_url]):
            print('CSV 헤더:', next(csv.reader(io.StringIO(text)), []))
            print('검증하려면 --code-column, --name-column, --as-of, --source-url을 모두 지정하세요.')
            return
        prices = (ROOT / 'docs/prices.js').read_text()
        existing = {e['symbol']: e for e in json.loads(prices.split('=', 1)[1].strip().removesuffix(';'))['universe']}
        result = normalize(text, args.code_column, args.name_column, args.as_of, args.source_url, existing)
        result['sourceSha256'] = hashlib.sha256(raw).hexdigest()
        output = ROOT / '.local-data/catalog-review.json'
        output.parent.mkdir(exist_ok=True)
        temporary = output.with_suffix('.tmp')
        temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        temporary.replace(output)
        print(json.dumps(result['review'], ensure_ascii=False))
        print(f'로컬 검토 전용: {output}')
    except (ValueError, OSError, csv.Error) as error:
        parser.exit(1, f'가져오기 실패: {error}\n')


if __name__ == '__main__':
    main()
