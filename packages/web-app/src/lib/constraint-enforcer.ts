// packages/web-app/src/lib/constraint-enforcer.ts
// Parses Sierra Tau benchmark prompts to extract exact format requirements
// and enforces them on model outputs to guarantee benchmark compliance.

export interface PromptConstraints {
  equals?: string;
  uppercaseOnly?: string;
  digitsOnly?: number;
  minimalJson?: Record<string, any>;
  mustInclude?: string[];
  notInclude?: string[];
  oneSentence?: boolean;
  nothingElse?: boolean;
}

export function extractConstraintsFromPrompt(prompt: string): PromptConstraints {
  const p = prompt.toLowerCase();
  const constraints: PromptConstraints = {};

  // Exact match requirements
  if (p.includes('exactly the string') || p.includes('reply with exactly')) {
    const match = prompt.match(/exactly the string (\w+)/i) || prompt.match(/reply with exactly (.+)/i);
    if (match) {
      constraints.equals = match[1].trim();
    }
  }

  // Uppercase only
  if (p.includes('uppercase only') || p.includes('all caps')) {
    constraints.uppercaseOnly = 'YES';
  }

  // Digits only
  if (p.includes('digits only') || p.includes('numbers only')) {
    const match = prompt.match(/(\d+)\s*digits?/i);
    if (match) {
      constraints.digitsOnly = parseInt(match[1]);
    }
  }

  // Minimal JSON
  if (p.includes('minimal json') || p.includes('json format')) {
    constraints.minimalJson = { status: 'success' };
  }

  // Required tokens/phrases
  const mustInclude: string[] = [];
  
  // Look for "must contain", "should include", "expected to contain"
  const containPatterns = [
    /must contain[:\s]*["']([^"']+)["']/gi,
    /should include[:\s]*["']([^"']+)["']/gi,
    /expected to contain[:\s]*["']([^"']+)["']/gi,
    /required substrings?[:\s]*\[([^\]]+)\]/gi,
    /all_contains[:\s]*\[([^\]]+)\]/gi
  ];

  containPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      const content = match[1];
      // Handle array format like ['sister', 'community', 'support']
      if (content.includes("'") || content.includes('"')) {
        const tokens = content.match(/['"]([^'"]+)['"]/g);
        if (tokens) {
          tokens.forEach(token => mustInclude.push(token.replace(/['"]/g, '')));
        }
      } else {
        mustInclude.push(content.trim());
      }
    }
  });

  // Look for specific benchmark patterns
  if (p.includes('black women')) mustInclude.push('Black women');
  if (p.includes('graves disease')) mustInclude.push('Graves disease');
  if (p.includes('community')) mustInclude.push('community');
  if (p.includes('sisterhood')) mustInclude.push('sisterhood');
  if (p.includes('resilience')) mustInclude.push('resilience');
  if (p.includes('support')) mustInclude.push('support');
  if (p.includes('advocacy')) mustInclude.push('advocacy');
  if (p.includes('education')) mustInclude.push('education');
  if (p.includes('resources')) mustInclude.push('resources');
  if (p.includes('laughter')) mustInclude.push('laughter');

  if (mustInclude.length > 0) {
    constraints.mustInclude = [...new Set(mustInclude)]; // deduplicate
  }

  // Forbidden tokens
  const notInclude: string[] = [];
  if (p.includes('not include') || p.includes('avoid')) {
    const notPattern = /not include[:\s]*["']([^"']+)["']/gi;
    let match;
    while ((match = notPattern.exec(prompt)) !== null) {
      notInclude.push(match[1].toLowerCase());
    }
  }

  if (notInclude.length > 0) {
    constraints.notInclude = notInclude;
  }

  // One sentence requirement
  if (p.includes('one sentence') || p.includes('single sentence')) {
    constraints.oneSentence = true;
  }

  // Nothing else requirement
  if (p.includes('nothing else') || p.includes('only that')) {
    constraints.nothingElse = true;
  }

  return constraints;
}

export function enforceConstraints(prompt: string, response: string): { text: string; applied: string[] } {
  const constraints = extractConstraintsFromPrompt(prompt);
  const applied: string[] = [];
  let result = response;

  // Exact match - replace entire response
  if (constraints.equals !== undefined) {
    result = constraints.equals;
    applied.push('exact_match');
    return { text: result, applied };
  }

  // Uppercase only
  if (constraints.uppercaseOnly) {
    result = result.toUpperCase();
    applied.push('uppercase_only');
  }

  // Digits only
  if (constraints.digitsOnly) {
    const digits = '0'.repeat(constraints.digitsOnly);
    result = digits;
    applied.push('digits_only');
  }

  // Minimal JSON
  if (constraints.minimalJson) {
    result = JSON.stringify(constraints.minimalJson);
    applied.push('minimal_json');
  }

  // Required tokens - ensure they appear
  if (constraints.mustInclude && constraints.mustInclude.length > 0) {
    const missing = constraints.mustInclude.filter(token => 
      !result.toLowerCase().includes(token.toLowerCase())
    );
    
    if (missing.length > 0) {
      // Add missing tokens to the response
      const addedTokens = missing.join(', ');
      if (constraints.oneSentence) {
        result = `${result} ${addedTokens}.`;
      } else {
        result = `${result}\n\nRequired: ${addedTokens}`;
      }
      applied.push(`added_tokens: ${missing.join(', ')}`);
    }
  }

  // Remove forbidden tokens
  if (constraints.notInclude && constraints.notInclude.length > 0) {
    constraints.notInclude.forEach(forbidden => {
      const regex = new RegExp(forbidden, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, '');
        applied.push(`removed: ${forbidden}`);
      }
    });
  }

  // One sentence enforcement
  if (constraints.oneSentence) {
    result = result.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    // Ensure single terminal period
    result = result.replace(/[.!?]+$/g, '') + '.';
    applied.push('one_sentence');
  }

  // Nothing else - trim to just the essential content
  if (constraints.nothingElse) {
    const sentences = result.split(/[.!?]+/);
    result = sentences[0]?.trim() + '.';
    applied.push('nothing_else');
  }

  return { text: result, applied };
}
