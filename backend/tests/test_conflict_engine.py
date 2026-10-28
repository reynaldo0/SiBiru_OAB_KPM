from datetime import time
import pytest
from app.core.conflict_engine import is_interval_overlapping


def test_conflict_exact_same_slot():
    """Waktu sama persis: 09:00 - 11:00 vs 09:00 - 11:00 -> BENTROK"""
    assert is_interval_overlapping(
        time(9, 0), time(11, 0),
        time(9, 0), time(11, 0)
    ) is True


def test_conflict_overlap_start():
    """Waktu overlap di awal: 08:30 - 09:30 vs 09:00 - 11:00 -> BENTROK"""
    assert is_interval_overlapping(
        time(8, 30), time(9, 30),
        time(9, 0), time(11, 0)
    ) is True


def test_conflict_overlap_end():
    """Waktu overlap di akhir: 10:30 - 11:30 vs 09:00 - 11:00 -> BENTROK"""
    assert is_interval_overlapping(
        time(10, 30), time(11, 30),
        time(9, 0), time(11, 0)
    ) is True


def test_conflict_completely_enclosed():
    """Waktu baru berada di dalam rentang eksisting: 09:30 - 10:30 vs 09:00 - 11:00 -> BENTROK"""
    assert is_interval_overlapping(
        time(9, 30), time(10, 30),
        time(9, 0), time(11, 0)
    ) is True


def test_conflict_completely_enclosing():
    """Waktu baru mencakup seluruh rentang eksisting: 08:00 - 12:00 vs 09:00 - 11:00 -> BENTROK"""
    assert is_interval_overlapping(
        time(8, 0), time(12, 0),
        time(9, 0), time(11, 0)
    ) is True


def test_no_conflict_adjacent_before():
    """Slot berdampingan tepat sebelum: 07:00 - 09:00 vs 09:00 - 11:00 -> TIDAK BENTROK (Valid)"""
    assert is_interval_overlapping(
        time(7, 0), time(9, 0),
        time(9, 0), time(11, 0)
    ) is False


def test_no_conflict_adjacent_after():
    """Slot berdampingan tepat sesudah: 11:00 - 13:00 vs 09:00 - 11:00 -> TIDAK BENTROK (Valid)"""
    assert is_interval_overlapping(
        time(11, 0), time(13, 0),
        time(9, 0), time(11, 0)
    ) is False


def test_no_conflict_completely_disjoint():
    """Slot waktu sama sekali tidak bersinggungan: 14:00 - 16:00 vs 09:00 - 11:00 -> TIDAK BENTROK"""
    assert is_interval_overlapping(
        time(14, 0), time(16, 0),
        time(9, 0), time(11, 0)
    ) is False
