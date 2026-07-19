#!/usr/bin/env python3
"""
Sample Industrial PDF Generator
================================
Creates a realistic industrial document PDF for testing the pipeline.

Usage:
    python scripts/generate_sample_pdf.py [output_path]
    
Example:
    python scripts/generate_sample_pdf.py sample_docs/test_document.pdf
"""

import sys
import os
from pathlib import Path

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
except ImportError:
    print("Error: reportlab not installed")
    print("Install with: pip install reportlab")
    sys.exit(1)


def generate_sample_industrial_pdf(output_path: str = "sample_docs/test_industrial_manual.pdf"):
    """Generate a realistic industrial equipment manual PDF."""
    
    # Ensure output directory exists
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create PDF
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    
    # Container for content
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2a2a2a'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title Page
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph("EQUIPMENT OPERATION MANUAL", title_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Centrifugal Pump P-101A/B", styles['Heading2']))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Document No: OEM-2024-001", styles['Normal']))
    story.append(Paragraph("Revision: Rev 3.2", styles['Normal']))
    story.append(Paragraph("Date: 2024-01-15", styles['Normal']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Compliance: OISD-STD-144, PESO Regulations", styles['Normal']))
    story.append(PageBreak())
    
    # Section 1: Equipment Overview
    story.append(Paragraph("1. EQUIPMENT OVERVIEW", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    overview_text = """
    The centrifugal pump system P-101A/B is a critical component in the main process line. 
    This dual-redundant system ensures continuous operation with automatic switchover capability. 
    The primary pump P-101A operates under normal conditions, while standby pump P-101B provides 
    backup during maintenance or emergency situations.
    """
    story.append(Paragraph(overview_text, styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Equipment Specifications Table
    story.append(Paragraph("1.1 Technical Specifications", styles['Heading3']))
    story.append(Spacer(1, 0.1*inch))
    
    spec_data = [
        ['Parameter', 'Value', 'Unit'],
        ['Equipment Tag', 'P-101A/B', '-'],
        ['Flow Rate', '250', 'GPM'],
        ['Discharge Pressure', '150', 'PSI'],
        ['Operating Temperature', '85', '°C'],
        ['Motor Power', '50', 'HP'],
        ['Impeller Material', 'SS316', '-'],
        ['Maximum Pressure', '200', 'PSI'],
    ]
    
    spec_table = Table(spec_data, colWidths=[2.5*inch, 1.5*inch, 1*inch])
    spec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(spec_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Section 2: Operating Procedures
    story.append(PageBreak())
    story.append(Paragraph("2. OPERATING PROCEDURES", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    operating_text = """
    <b>2.1 Pre-Start Checklist</b><br/>
    Before starting the pump, ensure all pre-operational checks are completed:<br/>
    <br/>
    1. Verify suction valve V-100 is fully open<br/>
    2. Check discharge valve V-101 position (25% open for startup)<br/>
    3. Confirm seal flush system TK-50 level is adequate<br/>
    4. Inspect pressure gauges PI-100 and PI-101 for proper function<br/>
    5. Verify motor rotation direction matches arrow on coupling guard<br/>
    <br/>
    <b>2.2 Startup Sequence</b><br/>
    1. Start seal flush pump P-102 and confirm flow rate of 2 GPM<br/>
    2. Activate cooling water system - verify temperature below 35°C<br/>
    3. Press START button on local control panel PNL-101<br/>
    4. Monitor discharge pressure - should reach 150 PSI within 30 seconds<br/>
    5. Slowly open discharge valve V-101 to 100% over 2 minutes<br/>
    6. Verify no abnormal vibration or noise<br/>
    7. Record startup parameters in log sheet LS-2024-001<br/>
    <br/>
    <b>2.3 Normal Operation</b><br/>
    During normal operation, monitor the following parameters hourly:<br/>
    - Suction pressure: 20-25 PSI (PI-100)<br/>
    - Discharge pressure: 145-155 PSI (PI-101)<br/>
    - Bearing temperature: Below 75°C (TE-100)<br/>
    - Seal leakage: Less than 1 drop per minute<br/>
    - Motor current: 42-48 Amps (AI-100)<br/>
    """
    story.append(Paragraph(operating_text, styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Section 3: Maintenance
    story.append(PageBreak())
    story.append(Paragraph("3. MAINTENANCE REQUIREMENTS", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    maintenance_text = """
    Maintenance activities must comply with Factory Act requirements and OISD-STD-144 guidelines.
    All maintenance work requires a valid work permit and must be documented in the maintenance 
    management system.
    """
    story.append(Paragraph(maintenance_text, styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Maintenance Schedule Table
    story.append(Paragraph("3.1 Preventive Maintenance Schedule", styles['Heading3']))
    story.append(Spacer(1, 0.1*inch))
    
    maintenance_data = [
        ['Frequency', 'Activity', 'Reference Document'],
        ['Daily', 'Visual inspection, parameter recording', 'SOP-PM-001'],
        ['Weekly', 'Vibration monitoring, alignment check', 'SOP-PM-002'],
        ['Monthly', 'Lubrication, coupling inspection', 'SOP-PM-003'],
        ['Quarterly', 'Seal inspection, pressure test', 'SOP-PM-004'],
        ['Annually', 'Complete overhaul, performance test', 'SOP-PM-005'],
    ]
    
    maint_table = Table(maintenance_data, colWidths=[1.5*inch, 2.5*inch, 1.5*inch])
    maint_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(maint_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Section 4: Safety
    story.append(PageBreak())
    story.append(Paragraph("4. SAFETY REQUIREMENTS", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    safety_text = """
    <b>4.1 General Safety</b><br/>
    All personnel working on or near equipment P-101A/B must comply with:<br/>
    - PESO (Petroleum and Explosives Safety Organization) regulations<br/>
    - OISD-STD-144: Firefighting & Safety Practices<br/>
    - BIS-5120: Industrial Safety Standards<br/>
    - Factory Act 1948 requirements<br/>
    <br/>
    <b>4.2 Personal Protective Equipment (PPE)</b><br/>
    Mandatory PPE for pump area:<br/>
    - Safety helmet with chin strap<br/>
    - Safety shoes with steel toe cap<br/>
    - Safety glasses with side shields<br/>
    - Hearing protection in high noise areas (>85 dB)<br/>
    - Chemical resistant gloves when handling process fluids<br/>
    <br/>
    <b>4.3 Emergency Shutdown</b><br/>
    Emergency stop button ESB-101 is located at:<br/>
    - Local control panel PNL-101<br/>
    - Main control room CCR-A<br/>
    - Emergency muster point EMP-3<br/>
    <br/>
    In case of emergency, press ESB-101 and notify control room immediately.<br/>
    Evacuation alarm will sound automatically if pressure exceeds 180 PSI.<br/>
    <br/>
    <b>4.4 Incident Reporting</b><br/>
    All incidents, near-misses, and safety observations must be reported within 24 hours 
    using form SF-100. Contact safety officer Mr. Rajesh Kumar (Ext: 2345) for immediate assistance.
    """
    story.append(Paragraph(safety_text, styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Section 5: Troubleshooting
    story.append(PageBreak())
    story.append(Paragraph("5. TROUBLESHOOTING GUIDE", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    troubleshooting_data = [
        ['Problem', 'Possible Cause', 'Action'],
        ['Low discharge pressure', 'Worn impeller', 'Inspect and replace if needed'],
        ['High vibration', 'Misalignment or cavitation', 'Check alignment, verify NPSH'],
        ['Excessive noise', 'Air entrainment', 'Check suction line for leaks'],
        ['Seal leakage', 'Worn seal faces', 'Replace mechanical seal'],
        ['Motor overload', 'Excessive flow or blockage', 'Check discharge valve position'],
        ['High temperature', 'Insufficient cooling', 'Verify cooling water flow'],
    ]
    
    trouble_table = Table(troubleshooting_data, colWidths=[1.8*inch, 1.8*inch, 1.9*inch])
    trouble_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightyellow),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(trouble_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Footer section
    story.append(PageBreak())
    story.append(Paragraph("6. DOCUMENT CONTROL", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    footer_text = """
    <b>Revision History:</b><br/>
    Rev 3.2 (2024-01-15): Updated maintenance schedule, added troubleshooting guide<br/>
    Rev 3.1 (2023-10-20): Added safety requirements per PESO guidelines<br/>
    Rev 3.0 (2023-07-15): Complete rewrite for OISD-STD-144 compliance<br/>
    <br/>
    <b>Approvals:</b><br/>
    Prepared by: Amit Sharma, Maintenance Engineer (2024-01-10)<br/>
    Reviewed by: Dr. Priya Verma, Process Safety Manager (2024-01-12)<br/>
    Approved by: Rajesh Patel, Plant Manager (2024-01-15)<br/>
    <br/>
    <b>Distribution:</b><br/>
    - Operations Department (3 copies)<br/>
    - Maintenance Department (2 copies)<br/>
    - Safety Department (1 copy)<br/>
    - Document Control Center (Master copy)<br/>
    <br/>
    <b>Contact Information:</b><br/>
    For technical queries: maintenance@industrial-plant.com<br/>
    For safety concerns: safety@industrial-plant.com<br/>
    Emergency hotline: 1800-SAFETY-1<br/>
    <br/>
    This document is proprietary and confidential. Unauthorized distribution is prohibited.
    """
    story.append(Paragraph(footer_text, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    
    print(f"✓ Sample industrial PDF generated: {output_path}")
    print(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")
    print(f"\nTest this PDF with:")
    print(f"  python scripts/test_production_pipeline.py {output_path} --detailed")


def main():
    output_path = sys.argv[1] if len(sys.argv) > 1 else "sample_docs/test_industrial_manual.pdf"
    
    try:
        generate_sample_industrial_pdf(output_path)
    except Exception as e:
        print(f"Error generating PDF: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
