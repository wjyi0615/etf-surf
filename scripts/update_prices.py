"""Refresh all NAVER snapshots together; retain published prices on any failure."""
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json
import math
import os
import tempfile
import time
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'window.ETF_DATA = '


def atomic_write(path, text):
    """Serialize before replacing a public file in one operation."""
    with tempfile.NamedTemporaryFile('w', dir=path.parent, encoding='utf-8', delete=False) as f:
        f.write(text)
    os.replace(f.name, path)


def cutoff(now):
    """Same-day bars become eligible after 18:00 Seoul, including manual runs."""
    local = now.astimezone(ZoneInfo('Asia/Seoul'))
    return local.date() if local.hour >= 18 else local.date() - timedelta(days=1)


def parse(payload, end):
    """Validate EUC-KR XML dates, closes and volumes; do not fill gaps."""
    rows = {}
    for item in ET.fromstring(payload.decode('euc-kr')).iter('item'):
        fields = item.attrib['data'].split('|')
        if len(fields) != 6:
            raise ValueError('Unexpected NAVER schema')
        day = datetime.strptime(fields[0], '%Y%m%d').date()
        if day > end:
            continue
        close, volume = float(fields[4]), float(fields[5])
        if (day.isoformat() in rows or not math.isfinite(close) or close <= 0
                or not math.isfinite(volume) or volume < 0 or not volume.is_integer()):
            raise ValueError('Invalid or duplicate NAVER observation')
        rows[day.isoformat()] = (close, int(volume))
    if len(rows) < 2 or (end - date.fromisoformat(max(rows))).days > 10:
        raise ValueError('Empty or stale NAVER response')
    return rows


def fetch(symbol):
    """Bound network retries; never switch price providers silently."""
    if len(symbol) != 6 or not symbol.isdigit():
        raise ValueError('Invalid symbol')
    url = 'https://fchart.stock.naver.com/sise.nhn?' + urlencode(
        dict(symbol=symbol, timeframe='day', count=6000, requestType=0))
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'ETF-Surf/1.0'}), timeout=30) as response:
                return response.read()
        except OSError:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def refresh(old, end, fetcher=fetch):
    """Keep each listing's history; require complete overlapping trading calendars."""
    frames = {e['symbol']: parse(fetcher(e['symbol']), end) for e in old['universe']}
    first = old['dates'][0]
    calendars = {s: sorted(d for d in rows if d >= first) for s, rows in frames.items()}
    dates = calendars[old['universe'][0]['symbol']]
    if not dates or dates[0] != first or dates[-1] < old['as_of'] or not set(old['dates']).issubset(dates):
        raise ValueError('Missing reference history')
    for symbol, days in calendars.items():
        prior = old.get('dates_by_symbol', {}).get(symbol, old['dates']) if symbol in old['prices'] else []
        if (len(days) < 2 or days != [d for d in dates if d >= days[0]]
                or not set(prior).issubset(days)):
            raise ValueError('Missing history or mismatched ETF calendars: ' + symbol)
    updated = {**old, 'dates': dates, 'as_of': dates[-1],
               'generated_at': datetime.now(ZoneInfo('UTC')).isoformat(),
               'dates_by_symbol': calendars,
               'calendar_policy': 'Per-listing dates; complete overlapping sessions; no fill',
               'prices': {s: [rows[d][0] for d in calendars[s]] for s, rows in frames.items()},
               'volumes': {s: [rows[d][1] for d in calendars[s]] for s, rows in frames.items()}}
    # Surf calculates metrics from prices; inherited precomputed Lab periods would be stale.
    updated.pop('periods', None)
    return updated


def run(root=ROOT, fetcher=fetch, now=None):
    """Publish status independently; failed collections cannot touch last good prices."""
    now = now or datetime.now(ZoneInfo('Asia/Seoul'))
    output = root / 'docs/prices.js'
    status = {'attemptedAt': now.isoformat(), 'state': 'failed'}
    try:
        text = output.read_text(encoding='utf-8')
        if not text.startswith(PREFIX):
            raise ValueError('Unknown snapshot format')
        old = json.loads(text[len(PREFIX):].strip().rstrip(';'))
        updated = refresh(old, cutoff(now), fetcher)
        atomic_write(output, PREFIX + json.dumps(updated, ensure_ascii=False, allow_nan=False, separators=(',', ':')) + ';\n')
        status.update(state='success', asOf=updated['as_of'])
    except Exception as exc:
        print(f'Update failed: {type(exc).__name__}: {exc}')
    atomic_write(root / 'docs/update-status.js', 'window.ETF_UPDATE = ' + json.dumps(status) + ';\n')
    return 0 if status['state'] == 'success' else 1


if __name__ == '__main__':
    raise SystemExit(run())
