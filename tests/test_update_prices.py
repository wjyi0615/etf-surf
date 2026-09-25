"""Failure retention and calendar integrity checks without network requests."""
from datetime import datetime, date
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import unittest
from scripts.update_prices import PREFIX, parse, refresh, run, cutoff


def payload(days=('20260922', '20260923', '20260924'), close='100'):
    return ('<chart>' + ''.join(f'<item data="{d}|1|1|1|{close}|20"/>' for d in days) + '</chart>').encode()


class Updates(unittest.TestCase):
    def setUp(self):
        self.old = dict(universe=[{'symbol': '069500'}, {'symbol': '114260'}],
                        dates=['2026-09-22', '2026-09-23'], as_of='2026-09-23',
                        prices={'069500': [100, 100], '114260': [100, 100]}, periods={'all': 'old'})

    def test_complete_update_and_remove_stale_metrics(self):
        new = refresh(self.old, date(2026, 9, 24), lambda s: payload())
        self.assertEqual(new['as_of'], '2026-09-24')
        self.assertNotIn('periods', new)
        self.assertEqual(new['volumes']['069500'], [20, 20, 20])

    def test_mismatch_invalid_and_stale(self):
        with self.assertRaises(ValueError):
            refresh(self.old, date(2026, 9, 24), lambda s: payload() if s == '069500' else payload(('20260922','20260923')))
        for close in ['0', '-1', 'nan', 'inf']:
            with self.assertRaises(ValueError): parse(payload(close=close), date(2026, 9, 24))
        with self.assertRaises(ValueError): parse(payload(), date(2026, 10, 20))
        with self.assertRaises(ValueError): parse(payload(('20260922','20260922')), date(2026, 9, 24))

    def test_failure_preserves_exact_bytes_and_recovery(self):
        with TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'docs').mkdir()
            output = root / 'docs/prices.js'
            original = PREFIX + json.dumps(self.old) + ';\n'
            output.write_text(original)
            now = datetime.fromisoformat('2026-09-24T19:00:00+09:00')
            def fail(symbol): raise OSError('offline')
            self.assertEqual(run(root, fail, now), 1)
            self.assertEqual(output.read_text(), original)
            self.assertIn('"failed"', (root / 'docs/update-status.js').read_text())
            self.assertEqual(run(root, lambda s: payload(), now), 0)
            self.assertIn('"success"', (root / 'docs/update-status.js').read_text())

    def test_completed_session(self):
        self.assertEqual(cutoff(datetime.fromisoformat('2026-09-24T17:59:00+09:00')), date(2026,9,23))
        self.assertEqual(cutoff(datetime.fromisoformat('2026-09-24T18:00:00+09:00')), date(2026,9,24))
