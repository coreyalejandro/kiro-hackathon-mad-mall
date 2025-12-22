#!/usr/bin/env python3
"""
Zaji Sierra Tau Benchmark Reporter
Generates HTML and Markdown reports from benchmark results
"""

import json
import sys
from argparse import ArgumentParser
from pathlib import Path
from typing import Dict, List, Any, Optional
from jinja2 import Template


class BenchmarkReporter:
    def __init__(self):
        self.html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zaji Sierra Tau Benchmark Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1em; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; color: #667eea; margin: 0; }
        .suite { margin-bottom: 40px; }
        .suite-header { background: #e9ecef; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; }
        .suite-header h2 { margin: 0; color: #333; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        .results-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
        .results-table tr:hover { background: #f8f9fa; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .prompt-cell { max-width: 300px; word-wrap: break-word; }
        .response-cell { max-width: 400px; word-wrap: break-word; }
        .reason-cell { max-width: 200px; word-wrap: break-word; font-size: 0.9em; color: #6c757d; }
        .footer { text-align: center; padding: 20px; color: #6c757d; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Zaji Sierra Tau Benchmark Report</h1>
            <p class="subtitle">Run: {{ timestamp }} | Overall Accuracy: {{ "%.1f"|format(overall_accuracy * 100) }}%</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>Overall Accuracy</h3>
                    <p class="value">{{ "%.1f"|format(overall_accuracy * 100) }}%</p>
                </div>
                <div class="summary-card">
                    <h3>Total Items</h3>
                    <p class="value">{{ total_items }}</p>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <p class="value">{{ total_passed }}</p>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <p class="value">{{ total_failed }}</p>
                </div>
            </div>
            
            {% for suite_name, suite_data in suites.items() %}
            <div class="suite">
                <div class="suite-header">
                    <h2>{{ suite_name.upper() }} Suite</h2>
                    <p>Accuracy: {{ "%.1f"|format(suite_data.accuracy * 100) }}% ({{ suite_data.passed_items }}/{{ suite_data.total_items }})</p>
                </div>
                
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Prompt</th>
                            <th>Response</th>
                            <th>Status</th>
                            <th>Latency (ms)</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for result in suite_data.results %}
                        <tr>
                            <td>{{ result.id }}</td>
                            <td class="prompt-cell">{{ result.prompt[:100] }}{% if result.prompt|length > 100 %}...{% endif %}</td>
                            <td class="response-cell">{{ result.response[:100] }}{% if result.response|length > 100 %}...{% endif %}</td>
                            <td class="{% if result.evaluation.passed %}status-pass{% else %}status-fail{% endif %}">
                                {% if result.evaluation.passed %}PASS{% else %}FAIL{% endif %}
                            </td>
                            <td>{{ result.latency_ms }}</td>
                            <td class="reason-cell">{{ result.evaluation.reason }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
            {% endfor %}
        </div>
        
        <div class="footer">
            <p>Generated by Zaji Sierra Tau Benchmark Suite</p>
        </div>
    </div>
</body>
</html>
        """
    
    def generate_html_report(self, summary: Dict[str, Any], output_file: Path):
        """Generate HTML report from benchmark summary"""
        template = Template(self.html_template)
        html_content = template.render(**summary)
        
        with open(output_file, 'w') as f:
            f.write(html_content)
    
    def generate_markdown_report(self, summary: Dict[str, Any], output_file: Path):
        """Generate Markdown report from benchmark summary"""
        md_content = f"""# Zaji Sierra Tau Benchmark Report

**Run:** {summary['timestamp']}  
**Overall Accuracy:** {summary['overall_accuracy']:.1%}  
**Total Items:** {summary['total_items']}  
**Passed:** {summary['total_passed']}  
**Failed:** {summary['total_failed']}

## Summary

| Metric | Value |
|--------|-------|
| Overall Accuracy | {summary['overall_accuracy']:.1%} |
| Total Items | {summary['total_items']} |
| Passed | {summary['total_passed']} |
| Failed | {summary['total_failed']} |

## Suite Results

"""
        
        for suite_name, suite_data in summary['suites'].items():
            md_content += f"""### {suite_name.upper()} Suite

**Accuracy:** {suite_data['accuracy']:.1%} ({suite_data['passed_items']}/{suite_data['total_items']})

| ID | Prompt | Response | Status | Latency (ms) | Reason |
|----|--------|----------|--------|--------------|--------|
"""
            
            for result in suite_data['results']:
                status = "✅ PASS" if result['evaluation']['passed'] else "❌ FAIL"
                prompt_short = result['prompt'][:50] + "..." if len(result['prompt']) > 50 else result['prompt']
                response_short = result['response'][:50] + "..." if len(result['response']) > 50 else result['response']
                reason_short = result['evaluation']['reason'][:30] + "..." if len(result['evaluation']['reason']) > 30 else result['evaluation']['reason']
                
                md_content += f"| {result['id']} | {prompt_short} | {response_short} | {status} | {result['latency_ms']} | {reason_short} |\n"
            
            md_content += "\n"
        
        md_content += f"""
## Detailed Results

### Failed Items Analysis

"""
        
        # Add analysis of failed items
        for suite_name, suite_data in summary['suites'].items():
            failed_items = [r for r in suite_data['results'] if not r['evaluation']['passed']]
            if failed_items:
                md_content += f"#### {suite_name.upper()} Suite Failures\n\n"
                for item in failed_items:
                    md_content += f"**{item['id']}:** {item['evaluation']['reason']}\n\n"
        
        with open(output_file, 'w') as f:
            f.write(md_content)
    
    def report_latest_run(self, outputs_dir: str = "outputs"):
        """Generate reports for the most recent benchmark run"""
        outputs_path = Path(outputs_dir)
        
        if not outputs_path.exists():
            print(f"Outputs directory {outputs_dir} not found")
            return False
        
        # Find the latest run directory
        run_dirs = [d for d in outputs_path.iterdir() if d.is_dir()]
        if not run_dirs:
            print(f"No benchmark runs found in {outputs_dir}")
            return False
        
        latest_run = max(run_dirs, key=lambda d: d.name)
        print(f"Generating reports for: {latest_run}")
        
        # Load summary
        summary_file = latest_run / 'scores_summary.json'
        if not summary_file.exists():
            print(f"Summary file not found: {summary_file}")
            print("Run score_benchmark.py first to generate scores")
            return False
        
        with open(summary_file, 'r') as f:
            summary = json.load(f)
        
        # Generate HTML report
        html_file = latest_run / 'report.html'
        self.generate_html_report(summary, html_file)
        print(f"HTML report generated: {html_file}")
        
        # Generate Markdown report
        md_file = latest_run / 'report.md'
        self.generate_markdown_report(summary, md_file)
        print(f"Markdown report generated: {md_file}")
        
        return True


def main():
    parser = ArgumentParser(description="Generate Zaji Sierra Tau benchmark reports")
    parser.add_argument("--latest", action="store_true", help="Report on the latest run")
    parser.add_argument("--outputs", default="outputs", help="Outputs directory")
    
    args = parser.parse_args()
    
    reporter = BenchmarkReporter()
    
    if args.latest:
        success = reporter.report_latest_run(args.outputs)
        if not success:
            sys.exit(1)
    else:
        print("Use --latest to generate reports for the most recent benchmark run")
        sys.exit(1)


if __name__ == "__main__":
    main()
