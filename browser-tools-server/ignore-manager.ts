import fs from "fs";
import { createReadStream } from "fs";
import { createInterface } from "readline";

// Class to manage ignore patterns
export class IgnoreManager {
  private patterns: RegExp[] = [];

  /**
   * Load ignore patterns from a file
   * @param filePath - Path to the ignore file
   * @returns Promise that resolves when patterns are loaded
   */
  async loadPatternsFromFile(filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      console.error(`Ignore file not found: ${filePath}`);
      return;
    }

    try {
      console.log(`Loading ignore patterns from: ${filePath}`);
      const fileStream = createReadStream(filePath);
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      // Clear existing patterns
      this.patterns = [];

      for await (const line of rl) {
        // Skip empty lines and comments
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          try {
            const pattern = new RegExp(trimmedLine, "i");
            this.patterns.push(pattern);
            console.log(`Added ignore pattern: ${trimmedLine}`);
          } catch (err) {
            console.error(`Invalid regex pattern: ${trimmedLine}`, err);
          }
        }
      }

      console.log(`Loaded ${this.patterns.length} ignore patterns`);
    } catch (err) {
      console.error(`Error loading ignore patterns: ${err}`);
    }
  }

  /**
   * Check if a console log should be ignored based on its message
   * @param message - The console log message
   * @returns true if the log should be ignored
   */
  shouldIgnoreConsoleLog(message: string): boolean {
    if (this.patterns.length === 0 || !message) return false;
    return this.patterns.some((pattern) => pattern.test(message));
  }

  /**
   * Check if a network request should be ignored based on its URL
   * @param url - The network request URL
   * @returns true if the request should be ignored
   */
  shouldIgnoreNetworkRequest(url: string): boolean {
    if (this.patterns.length === 0 || !url) return false;
    return this.patterns.some((pattern) => pattern.test(url));
  }

  /**
   * Get the current count of loaded patterns
   * @returns Number of patterns loaded
   */
  getPatternCount(): number {
    return this.patterns.length;
  }

  /**
   * Get all loaded patterns
   * @returns Array of RegExp patterns
   */
  getPatterns(): RegExp[] {
    return [...this.patterns];
  }
}
