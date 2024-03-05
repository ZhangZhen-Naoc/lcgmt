from lcgmt.model import Instrument, Source
from .ReferenceTable import IInstruTable, ISourceTable

class DoNothingInstruTable(IInstruTable):
    def find_by_name(self, name: str) -> Instrument:
        return Instrument(id=int(name[-1]),name=name,energy_start=0.5,energy_end=4)

class DoNothingSourceTable(ISourceTable):
    def find(self, src: Source) -> Source:
        return src