"""Synthetic inputs only; no KRX dataset is embedded in these tests."""
import unittest
from scripts.import_catalog import normalize


class CatalogImport(unittest.TestCase):
    def parse(self, text, **overrides):
        args = dict(code_column='code', name_column='name', as_of='2026-01-01',
                    source_url='https://data.krx.co.kr/',
                    existing={'000001': {'name': 'old'}, '000002': {'name': 'missing'}})
        return normalize(text, **(args | overrides))

    def test_join_unknowns_and_large_catalog(self):
        text = 'code,name\n' + '\n'.join(f'{i:06d},sample {i}' for i in range(1, 1101))
        result = self.parse(text)
        self.assertEqual(result['review']['count'], 1100)
        self.assertEqual(result['review']['matched'], 2)
        self.assertIsNone(result['funds'][-1]['category'])
        self.assertEqual(result['publicationStatus'], 'unreviewed')
        result = self.parse('code,name\n000001,changed\n00000A,new\n')
        self.assertEqual(result['review']['missingExisting'], ['000002'])
        self.assertEqual(result['review']['renamed'], ['000001'])
        self.assertEqual(result['funds'][0]['ticker'], '000001')

    def test_reject_bad_inputs(self):
        for text in ['code,name\n', 'code,name\n1,test', 'code,name\n000001,',
                     'code,name\n000001,a\n000001,b', 'code,name\n000001',
                     'code,name\n000001,a,extra', 'code,code\n000001,a']:
            with self.subTest(text=text), self.assertRaises(ValueError):
                self.parse(text)
        for overrides in [dict(as_of='2099-01-01'), dict(as_of='2026-02-30'),
                          dict(source_url='http://example.com/'),
                          dict(source_url='https://user:password@example.com/'),
                          dict(source_url='https:///'), dict(source_name=' ')]:
            with self.assertRaises(ValueError):
                self.parse('code,name\n000001,a', **overrides)

    def test_other_source_is_not_automatically_approved(self):
        result = self.parse('code,name\n000001,a', source_url='https://example.com/catalog',
                            source_name='테스트 제공자', permission_note='검토 문서 참조')
        self.assertEqual(result['sourceName'], '테스트 제공자')
        self.assertEqual(result['publicationStatus'], 'unreviewed')
        self.assertEqual(result['permissionNote'], '검토 문서 참조')


if __name__ == '__main__':
    unittest.main()
