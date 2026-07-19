from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class NodeBase(BaseModel):
    pass

class Equipment(NodeBase):
    tag: str = Field(description="Unique equipment identifier, e.g., P-101A")
    description: str = Field(description="Description of the equipment")
    equipment_type: Optional[str] = Field(default=None, description="Type of equipment, e.g., Pump, Compressor")
    location: Optional[str] = Field(default=None, description="Physical location in the plant")

class Document(NodeBase):
    doc_id: str = Field(description="Unique document identifier")
    title: str = Field(description="Title of the document")
    doc_type: str = Field(description="Type of document, e.g., work_order, manual")
    url: Optional[str] = Field(default=None, description="URL or file path")
    created_date: Optional[date] = Field(default=None, description="Date the document was created")

class FailureEvent(NodeBase):
    event_id: str = Field(description="Unique identifier for the failure event")
    date_occurred: date = Field(description="Date the failure occurred")
    description: str = Field(description="Description of the failure")
    severity: Optional[str] = Field(default=None, description="Severity of the failure")

class InspectionReport(Document):
    inspector: Optional[str] = Field(default=None, description="Name of the inspector")
    result: Optional[str] = Field(default=None, description="Result of the inspection, e.g., Pass, Fail")
