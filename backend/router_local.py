"""v401h: local heuristic router — zero cost, ~0ms.
Classifies before paid API. Handles greetings, math (incl. %), search, complex."""
import re
import datetime
import random

GREETING = re.compile(
    r'^(hi|hello|hey|yo|sup|thanks|thank you|ok|okay|k|bye|'
    r'good ?(morning|night|evening|afternoon)|how are you|what\'?s up|'
    r'who are you|what can you do|help|howdy)[\?\.\!\s]*$',
    re.I)

# X% of Y  |  X percent of Y  |  X% Y
PERCENT = re.compile(
    r'^\s*(?:what(?:\'s| is)|how much is|calculate|compute)?\s*'
    r'([\d,\.]+)\s*(?:%|percent)\s*(?:of\s+)?([\d,\.]+)\s*\??\s*$',
    re.I)

# basic arithmetic: 2+2, 100/4, 25*3, 17-5
ARITH = re.compile(
    r'^\s*(?:what(?:\'s| is)|calculate|compute|how much is)?\s*'
    r'([\d,\.]+)\s*([\+\-\*\/x×÷\^])\s*([\d,\.]+)\s*\??\s*$',
    re.I)

SEARCH = re.compile(
    r'\b(latest|newest|recent|current|today|tonight|tomorrow|this (week|month|year)|'
    r'who won|score|price|stock|release|launch|announce|2025|2026|2027)\b', re.I)

LARGE = re.compile(
    r'\b(design|architect|refactor|analyz|compar|research|investigat|optimi[sz]|debug|'
    r'step.by.step|in.depth|comprehensive|detailed|essay|report|plan|strateg|'
    r'explain (?:in detail|thoroughly|fully)|walk me through|build me|'
    r'write a (?:function|class|program|script))\b',
    re.I)

SMALL = re.compile(
    r'\b(translate|summariz|rewrite|shorten|expand|list|bullet|one.line|haiku|'
    r'fix grammar|spell check|rephrase|reword|tldr|tl;dr|quick)\b',
    re.I)


def classify(message):
    """Returns {level, search, confidence, quick_reply?, math?}
    level: no_llm | small | large"""
    m = (message or '').strip()
    if len(m) < 2:
        return {"level": "no_llm", "search": False, "confidence": "high",
                "quick_reply": "I'm here — what would you like to talk about?"}

    # greetings — canned reply
    if GREETING.match(m) and len(m) < 50:
        hour = datetime.datetime.now().hour
        part = "morning" if hour < 12 else "afternoon" if hour < 18 else "evening"
        canned = random.choice([
            f"Good {part}. How may I help you?",
            f"Good {part}. What's on your mind?",
            f"Good {part}. Ready when you are.",
        ])
        return {"level": "no_llm", "search": False, "confidence": "high",
                "quick_reply": canned}

    # percent math — highest priority (before generic math)
    if PERCENT.match(m) and len(m) < 80:
        return {"level": "no_llm", "search": False, "confidence": "high", "math": True}

    # basic arithmetic
    if ARITH.match(m) and len(m) < 60:
        return {"level": "no_llm", "search": False, "confidence": "high", "math": True}

    # needs web search
    if SEARCH.search(m):
        return {"level": "large", "search": True, "confidence": "high"}

    # complex reasoning
    if LARGE.search(m) or len(m) > 500:
        return {"level": "large", "search": False, "confidence": "medium"}

    # short / simple task
    if SMALL.search(m) or len(m) < 120:
        return {"level": "small", "search": False, "confidence": "medium"}

    return {"level": "large", "search": False, "confidence": "low"}


def eval_percent(expr):
    """Evaluate 'X% of Y' and 'X percent of Y'."""
    m = PERCENT.match((expr or '').strip())
    if not m:
        return None
    try:
        pct = float(m.group(1).replace(",", ""))
        base = float(m.group(2).replace(",", ""))
        return (pct / 100.0) * base
    except Exception:
        return None


def safe_math(expr):
    """Evaluate math: percent forms first, then basic arithmetic."""
    # 1) Percent form
    p = eval_percent(expr)
    if p is not None:
        return p

    # 2) Basic arithmetic
    m = ARITH.match((expr or '').strip())
    if m:
        try:
            a = float(m.group(1).replace(",", ""))
            op = m.group(2).lower().replace("x", "*").replace("×", "*").replace("÷", "/")
            b = float(m.group(3).replace(",", ""))
            if op == "+": return a + b
            if op == "-": return a - b
            if op == "*": return a * b
            if op == "/": return a / b if b != 0 else None
            if op == "^": return a ** b
        except Exception:
            return None
    return None
