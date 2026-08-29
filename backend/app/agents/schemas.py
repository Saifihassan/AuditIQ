from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal

class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")



class TechnicalIssue(StrictModel):
    category: Literal["indexing", "canonical", "metadata", "status", "schema", "url_structure"]
    severity: Literal["critical", "high", "medium", "low"]
    issue: str
    recommendation: str

class TechnicalSEOAnalysis(StrictModel):
    score: int = Field(ge=0, le=100, description="Score from 0 to 100")
    is_indexable: bool
    canonical_valid: bool
    title_status: Literal["good", "too_short", "too_long", "missing"]
    description_status: Literal["good", "too_short", "too_long", "missing"]
    has_valid_schema: bool
    issues: list[TechnicalIssue] = Field(default_factory=list)
    passed_audits: list[str] = Field(default_factory=list)

class ContentIssue(StrictModel):
    issue_type: Literal["heading_hierarchy", "thin_content", "keyword_stuffing", "readability", "image_alt"]
    severity: Literal["critical", "high", "medium", "low"]
    details: str
    fix: str

class ContentSEOAnalysis(StrictModel):
    score: int = Field(ge=0, le=100)
    word_count: int
    content_depth: Literal["thin", "adequate", "comprehensive"]
    h1_count: int
    has_duplicate_h1: bool
    images_missing_alt_count: int
    content_issues: list[ContentIssue] = Field(default_factory=list)
    key_topics_detected: list[str] = Field(default_factory=list)

class PerformanceIssue(StrictModel):
    issue_type: Literal["heavy_assets", "script_bloat", "unoptimized_images", "caching", "response_latency"]
    severity: Literal["critical", "high", "medium", "low"]
    details: str
    optimization_strategy: str

class PerformanceAnalysis(StrictModel):
    score: int = Field(ge=0, le=100)
    estimated_page_weight_kb: Optional[int] = None
    unoptimized_image_count: int
    script_count: int
    stylesheet_count: int
    performance_issues: list[PerformanceIssue] = Field(default_factory=list)

class PrioritizedAction(StrictModel):
    rank: int
    pillar: Literal["Technical", "Content", "Performance"]
    impact: Literal["high", "medium", "low"]
    effort: Literal["easy", "moderate", "complex"]
    task: str
    rationale: str

class StrategicAssessment(StrictModel):
    overall_seo_score: int = Field(ge=0, le=100)
    grade: Literal["A", "B", "C", "D", "F"]
    critical_blockers_count: int
    quick_wins: list[str] = Field(default_factory=list)
    prioritized_roadmap: list[PrioritizedAction] = Field(default_factory=list)

class ReportSection(StrictModel):
    title: str
    status: str
    key_findings: list[str]
    remediation_steps: list[str]

class FinalSEOReport(StrictModel):
    target_url: str
    executive_summary: str
    overall_grade: str
    overall_score: int
    top_3_priorities: list[str]
    technical_audit: ReportSection
    content_audit: ReportSection
    performance_audit: ReportSection
    thirty_day_action_plan: list[str]
