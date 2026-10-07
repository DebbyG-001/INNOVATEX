import math
from typing import Dict, List, Tuple

LEVEL_THRESHOLDS = [
    {"name": "Starter", "min": 0, "next": 500},
    {"name": "Builder", "min": 500, "next": 1500},
    {"name": "Achiever", "min": 1500, "next": 3500},
    {"name": "Champion", "min": 3500, "next": 7000},
    {"name": "Master", "min": 7000, "next": 10000},
]


def calculate_level(xp: int) -> Tuple[int, str]:
    current_index = 1
    current_name = LEVEL_THRESHOLDS[0]["name"]
    for i in range(len(LEVEL_THRESHOLDS) - 1, -1, -1):
        if xp >= LEVEL_THRESHOLDS[i]["min"]:
            current_index = i + 1
            current_name = LEVEL_THRESHOLDS[i]["name"]
            break
    return current_index, current_name


def determine_segment(occupation: str, primary_goal_name: str = "") -> Tuple[str, str, List[str]]:
    reasons = []
    if occupation == "student":
        reasons.append("You're currently a student building financial habits")
        if primary_goal_name:
            reasons.append(f"Your primary goal is {primary_goal_name}")
        else:
            reasons.append("Focusing on education and early savings milestones")
        return "student_saver", "Student Saver", reasons

    elif occupation in ["salaried", "civil_servant"]:
        if occupation == "civil_servant":
            reasons.append("You work in public service with predictable structured pay")
        else:
            reasons.append("You earn a regular salary with recurring pay cycles")
        reasons.append("Optimized for structured paycheck allocations and automated goals")
        return "salary_earner", "Salary Earner", reasons

    elif occupation == "business_owner":
        reasons.append("You manage commercial operations and business cash flows")
        reasons.append("Tailored for separating business income and building business reserves")
        return "business_builder", "Business Builder", reasons

    elif occupation == "freelancer":
        reasons.append("You earn project-based and variable contract income")
        reasons.append("Designed for variable cash flow buffers and flexible savings pacing")
        return "independent_earner", "Independent Earner", reasons

    else:
        reasons.append("Flexible saver profile adapted to your personal workflow")
        reasons.append("Adaptive savings tracking tuned to custom target schedules")
        return "flexible_saver", "Flexible Saver", reasons


def determine_financial_tier(
    monthly_target: int, income_stability: str, active_accounts: int
) -> Tuple[str, int, List[str]]:
    score = 0
    reasons = []

    if monthly_target >= 100000:
        score += 2
        reasons.append(f"Monthly target of ₦{monthly_target:,} meets Tier-2 threshold (+2)")
    elif monthly_target >= 30000:
        score += 1
        reasons.append(f"Monthly target of ₦{monthly_target:,} meets baseline threshold (+1)")
    else:
        reasons.append(f"Monthly target of ₦{monthly_target:,} establishes a manageable baseline (+0)")

    if income_stability == "stable":
        score += 1
        reasons.append("Income stability: Stable income stream (+1)")
    elif income_stability == "variable":
        reasons.append("Income stability: Variable cash inflow (+0)")
    else:
        reasons.append("Income stability: Irregular cash flow buffer (+0)")

    if active_accounts >= 2:
        score += 1
        reasons.append(f"{active_accounts} active bank accounts utilized (+1)")
    else:
        reasons.append(f"{active_accounts} active bank account configured (+0)")

    if score >= 4:
        tier = "prime"
    elif score >= 2:
        tier = "plus"
    else:
        tier = "essentials"

    return tier, score, reasons


def determine_savings_profile(
    occupation: str,
    goal_categories: List[str],
    has_emergency_savings: bool,
    digital_usage: str = "none",
) -> Tuple[str, str, List[str]]:
    reasons = []

    # 1. Money Learner
    if occupation == "student" and "education" in goal_categories:
        reasons.append("You selected an education-related goal as a student")
        reasons.append("You're starting your foundational financial growth journey")
        return "money_learner", "Money Learner", reasons

    # 2. Buffer Builder
    if "emergency_fund" in goal_categories or not has_emergency_savings:
        if not has_emergency_savings:
            reasons.append("You indicated you do not currently have an emergency safety net")
        if "emergency_fund" in goal_categories:
            reasons.append("You prioritized building an Emergency Fund goal")
        reasons.append("Prioritizing a foundational liquidity cushion before speculative allocations")
        return "buffer_builder", "Buffer Builder", reasons

    # 3. Digital Starter
    if digital_usage in ["none", "low"]:
        reasons.append("Digital payment activity indicates early digital banking adoption")
        reasons.append("Designed to build confidence with digital transfers and smart savings")
        return "digital_starter", "Digital Starter", reasons

    # 4. Streak Saver
    reasons.append("Consistent recurring savings discipline identified")
    reasons.append("Focused on weekly deposit streaks and milestone compounding")
    return "streak_saver", "Streak Saver", reasons


def calculate_required_monthly(target_amount: float, current_amount: float, months: int) -> float:
    safe_months = max(1, months)
    remaining = max(0.0, target_amount - current_amount)
    return math.ceil(remaining / safe_months)
