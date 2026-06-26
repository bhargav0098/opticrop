from fpdf import FPDF
import os

pdf_files = [
    ("TaskDeliverables_Member1_Priya.pdf", "Member 1 - Priya: Business Requirements, Workflows, Survey & Impact Report"),
    ("ER_Diagram_Member1.pdf", "Member 1 - Priya: Entity Relationship Diagram"),
    ("TaskDeliverables_Member5_Conclusion.pdf", "Member 5 - Kavya: Project Conclusion and Deployment Details"),
    ("OptiCrop_Final_Report.pdf", "OptiCrop Final Report - Combined Submissions")
]

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

for filename, title in pdf_files:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=15)
    pdf.cell(200, 10, txt="OptiCrop Project Deliverable", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=title, ln=True, align='C')
    pdf.cell(200, 10, txt="[This is a placeholder PDF file to be filled with final content]", ln=True, align='C')
    
    out_path = os.path.join(base_dir, filename)
    pdf.output(out_path)
    print(f"Created: {out_path}")
