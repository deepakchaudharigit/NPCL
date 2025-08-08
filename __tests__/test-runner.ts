/**
 * Comprehensive Test Runner for NPCL Dashboard
 *
 * This script provides utilities for running different test suites
 * and generating comprehensive test reports.
 */

import { execSync } from "child_process";
import { writeFileSync, existsSync } from "fs";
import path from "path";

interface TestSuite {
  name: string;
  pattern: string;
  description: string;
}

const testSuites: TestSuite[] = [
  {
    name: "unit",
    pattern: "__tests__/lib/**/*.test.ts",
    description: "Unit tests for library functions",
  },
  {
    name: "api",
    pattern: "__tests__/api/**/*.test.ts",
    description: "API route tests",
  },
  {
    name: "components",
    pattern: "__tests__/components/**/*.test.tsx",
    description: "React component tests",
  },
  {
    name: "hooks",
    pattern: "__tests__/hooks/**/*.test.ts",
    description: "Custom hook tests",
  },
  {
    name: "integration",
    pattern: "__tests__/integration/**/*.test.ts",
    description: "Integration tests",
  },
  {
    name: "security",
    pattern: "__tests__/**/*security*.test.ts",
    description: "Security-focused tests",
  },
  {
    name: "performance",
    pattern: "__tests__/**/*performance*.test.ts",
    description: "Performance tests",
  },
];

class TestRunner {
  private results: Map<string, any> = new Map();

  async runSuite(suite: TestSuite): Promise<void> {
    console.log(`\n🧪 Running ${suite.name} tests: ${suite.description}`);
    console.log(`Pattern: ${suite.pattern}`);

    try {
      const command = `npx jest ${suite.pattern} --verbose --coverage=false`;
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
      });

      this.results.set(suite.name, {
        success: true,
        output,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ ${suite.name} tests passed`);
    } catch (error: any) {
      this.results.set(suite.name, {
        success: false,
        error: error.message,
        output: error.stdout || "",
        timestamp: new Date().toISOString(),
      });

      console.log(`❌ ${suite.name} tests failed`);
      console.log(error.stdout || error.message);
    }
  }

  async runAllSuites(): Promise<void> {
    console.log("🚀 Starting comprehensive test run for NPCL Dashboard");
    console.log(`Running ${testSuites.length} test suites...\n`);

    for (const suite of testSuites) {
      await this.runSuite(suite);
    }

    this.generateReport();
  }

  async runCoverage(): Promise<void> {
    console.log("\n📊 Running coverage analysis...");

    try {
      const command =
        "npx jest --coverage --coverageReporters=text --coverageReporters=html --coverageReporters=json";
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
      });

      console.log("✅ Coverage analysis completed");
      console.log(output);
    } catch (error: any) {
      console.log("❌ Coverage analysis failed");
      console.log(error.stdout || error.message);
    }
  }

  async runSecurityTests(): Promise<void> {
    console.log("\n🔒 Running security-focused tests...");

    const securityPatterns = [
      "__tests__/lib/auth*.test.ts",
      "__tests__/lib/rbac.test.ts",
      "__tests__/api/auth/**/*.test.ts",
      "__tests__/middleware/**/*.test.ts",
    ];

    for (const pattern of securityPatterns) {
      try {
        const command = `npx jest ${pattern} --verbose`;
        execSync(command, { stdio: "inherit" });
      } catch (error) {
        console.log(`❌ Security tests failed for pattern: ${pattern}`);
      }
    }
  }

  async runPerformanceTests(): Promise<void> {
    console.log("\n⚡ Running performance tests...");

    try {
      const command = "npx jest __tests__/**/*performance*.test.ts --verbose";
      execSync(command, { stdio: "inherit" });
      console.log("✅ Performance tests completed");
    } catch (error) {
      console.log("❌ Performance tests failed");
    }
  }

  private generateReport(): void {
    console.log("\n📋 Test Results Summary");
    console.log("=".repeat(50));

    let totalPassed = 0;
    let totalFailed = 0;

    for (const [suiteName, result] of this.results) {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      console.log(
        `${status} ${suiteName.padEnd(15)} - ${testSuites.find((s) => s.name === suiteName)?.description}`,
      );

      if (result.success) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    }

    console.log("=".repeat(50));
    console.log(`Total: ${totalPassed + totalFailed} suites`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(
      `Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`,
    );

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalPassed + totalFailed,
        passed: totalPassed,
        failed: totalFailed,
        successRate: (totalPassed / (totalPassed + totalFailed)) * 100,
      },
      suites: Object.fromEntries(this.results),
    };

    const reportPath = path.join(process.cwd(), "test-results.json");
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  async validateTestSetup(): Promise<boolean> {
    console.log("🔍 Validating test setup...");

    const requiredFiles = [
      "jest.config.ts",
      "jest.setup.ts",
      "__tests__/utils/test-factories.ts",
      "__tests__/utils/test-helpers.ts",
    ];

    let allValid = true;

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - Missing`);
        allValid = false;
      }
    }

    if (allValid) {
      console.log("✅ Test setup validation passed");
    } else {
      console.log("❌ Test setup validation failed");
    }

    return allValid;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "all";

  const runner = new TestRunner();

  // Validate setup first
  const setupValid = await runner.validateTestSetup();
  if (!setupValid) {
    console.log(
      "❌ Test setup validation failed. Please fix the issues above.",
    );
    process.exit(1);
  }

  switch (command) {
    case "all":
      await runner.runAllSuites();
      break;

    case "coverage":
      await runner.runCoverage();
      break;

    case "security":
      await runner.runSecurityTests();
      break;

    case "performance":
      await runner.runPerformanceTests();
      break;

    case "suite":
      const suiteName = args[1];
      const suite = testSuites.find((s) => s.name === suiteName);
      if (suite) {
        await runner.runSuite(suite);
      } else {
        console.log(`❌ Unknown test suite: ${suiteName}`);
        console.log(
          "Available suites:",
          testSuites.map((s) => s.name).join(", "),
        );
      }
      break;

    default:
      console.log("Usage: npm run test:runner [command]");
      console.log("Commands:");
      console.log("  all        - Run all test suites");
      console.log("  coverage   - Run coverage analysis");
      console.log("  security   - Run security tests");
      console.log("  performance - Run performance tests");
      console.log("  suite <name> - Run specific test suite");
      console.log("\nAvailable test suites:");
      testSuites.forEach((suite) => {
        console.log(`  ${suite.name.padEnd(12)} - ${suite.description}`);
      });
  }
}

// Only run main if this file is executed directly (not during tests)
if (require.main === module) {
  main().catch(console.error);
}

export { TestRunner, testSuites };

// Test block required for Jest to recognize this as a valid test file
describe("TestRunner", () => {
  test("should instantiate TestRunner correctly", () => {
    const runner = new TestRunner();
    expect(runner).toBeInstanceOf(TestRunner);
  });

  test("should have valid test suites configuration", () => {
    expect(testSuites).toBeDefined();
    expect(Array.isArray(testSuites)).toBe(true);
    expect(testSuites.length).toBeGreaterThan(0);

    testSuites.forEach((suite) => {
      expect(suite).toHaveProperty("name");
      expect(suite).toHaveProperty("pattern");
      expect(suite).toHaveProperty("description");
      expect(typeof suite.name).toBe("string");
      expect(typeof suite.pattern).toBe("string");
      expect(typeof suite.description).toBe("string");
    });
  });

  test("should validate test setup method exists", () => {
    const runner = new TestRunner();
    expect(typeof runner.validateTestSetup).toBe("function");
  });
});
