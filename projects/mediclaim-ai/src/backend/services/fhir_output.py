"""
MediClaim AI — FHIR ExplanationOfBenefit Output
Wraps analysis results as a valid FHIR R4 ExplanationOfBenefit resource.
"""

import uuid
from typing import List
from backend.models.bill import BillAnalysisResponse, LineItem, Flag
from backend.models.fhir_models import (
    FHIRExplanationOfBenefit, FHIRCoding, FHIRCodeableConcept,
    FHIRMoney, FHIRReference, FHIRAdjudication, FHIRItem, FHIRTotal,
)


def build_eob(
    analysis: BillAnalysisResponse,
    insurance_provider: str = "Unknown"
) -> FHIRExplanationOfBenefit:
    """
    Convert a BillAnalysisResponse into a FHIR R4 ExplanationOfBenefit resource.
    """
    eob_id = analysis.bill_id or str(uuid.uuid4())

    # Build FHIR items from line items
    fhir_items: List[FHIRItem] = []
    for idx, item in enumerate(analysis.line_items, start=1):
        coding = []
        if item.cpt_code:
            coding.append(FHIRCoding(
                system="http://www.ama-assn.org/go/cpt",
                code=item.cpt_code,
                display=item.description,
            ))
        if item.rxnorm_id:
            coding.append(FHIRCoding(
                system="http://www.nlm.nih.gov/research/umls/rxnorm",
                code=item.rxnorm_id,
                display=item.description,
            ))

        # Adjudication: submitted, eligible, benefit
        adjudications = [
            FHIRAdjudication(
                category=FHIRCodeableConcept(
                    coding=[FHIRCoding(
                        system="http://terminology.hl7.org/CodeSystem/adjudication",
                        code="submitted",
                        display="Submitted Amount"
                    )]
                ),
                amount=FHIRMoney(value=item.amount)
            ),
        ]

        fhir_items.append(FHIRItem(
            sequence=idx,
            productOrService=FHIRCodeableConcept(
                coding=coding if coding else [FHIRCoding(
                    system="http://terminology.hl7.org/CodeSystem/ex-serviceproduct",
                    code="general",
                    display=item.description,
                )],
                text=item.description,
            ),
            net=FHIRMoney(value=item.amount),
            adjudication=adjudications,
        ))

    # Build totals
    totals = [
        FHIRTotal(
            category=FHIRCodeableConcept(
                coding=[FHIRCoding(
                    system="http://terminology.hl7.org/CodeSystem/adjudication",
                    code="submitted",
                    display="Submitted Amount"
                )]
            ),
            amount=FHIRMoney(value=analysis.total_charged),
        ),
        FHIRTotal(
            category=FHIRCodeableConcept(
                coding=[FHIRCoding(
                    system="http://terminology.hl7.org/CodeSystem/adjudication",
                    code="benefit",
                    display="Benefit Amount"
                )]
            ),
            amount=FHIRMoney(value=analysis.estimated_covered),
        ),
        FHIRTotal(
            category=FHIRCodeableConcept(
                coding=[FHIRCoding(
                    system="http://terminology.hl7.org/CodeSystem/adjudication",
                    code="copay",
                    display="Patient Responsibility"
                )]
            ),
            amount=FHIRMoney(value=analysis.out_of_pocket),
        ),
    ]

    return FHIRExplanationOfBenefit(
        id=eob_id,
        type=FHIRCodeableConcept(
            coding=[FHIRCoding(
                system="http://terminology.hl7.org/CodeSystem/claim-type",
                code="professional",
                display="Professional"
            )]
        ),
        patient=FHIRReference(reference="Patient/example"),
        insurer=FHIRReference(
            reference=f"Organization/{insurance_provider.lower().replace(' ', '-')}",
            display=insurance_provider,
        ),
        provider=FHIRReference(reference="Organization/provider"),
        item=fhir_items,
        total=totals,
    )
