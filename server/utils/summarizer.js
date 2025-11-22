/**
 * Extractive Text Summarization using TF-IDF and sentence scoring
 * This is a simple but effective algorithm that doesn't require external ML services
 */

class TextSummarizer {
  /**
   * Tokenize text into sentences
   */
  sentenceTokenize(text) {
    // Split by periods, exclamation marks, question marks
    return text
      .replace(/\n+/g, ' ')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short sentences
  }

  /**
   * Tokenize sentence into words
   */
  wordTokenize(sentence) {
    return sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2); // Filter out very short words
  }

  /**
   * Calculate word frequencies
   */
  calculateWordFrequencies(sentences) {
    const wordFreq = {};
    let maxFreq = 0;

    sentences.forEach(sentence => {
      const words = this.wordTokenize(sentence);
      words.forEach(word => {
        // Skip common stop words
        if (this.isStopWord(word)) return;
        
        wordFreq[word] = (wordFreq[word] || 0) + 1;
        maxFreq = Math.max(maxFreq, wordFreq[word]);
      });
    });

    // Normalize frequencies
    for (const word in wordFreq) {
      wordFreq[word] = wordFreq[word] / maxFreq;
    }

    return wordFreq;
  }

  /**
   * Check if word is a stop word (common words to ignore)
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'said', 'says', 'also', 'more', 'some',
      'into', 'out', 'up', 'down', 'over', 'under', 'again', 'than', 'so'
    ]);
    return stopWords.has(word);
  }

  /**
   * Score sentences based on word frequencies
   */
  scoreSentences(sentences, wordFreq) {
    return sentences.map(sentence => {
      const words = this.wordTokenize(sentence);
      let score = 0;
      let wordCount = 0;

      words.forEach(word => {
        if (wordFreq[word]) {
          score += wordFreq[word];
          wordCount++;
        }
      });

      // Average score per word
      return {
        sentence,
        score: wordCount > 0 ? score / wordCount : 0
      };
    });
  }

  /**
   * Main summarization function
   * @param {string} text - The text to summarize
   * @param {number} numSentences - Number of sentences in summary (default: 3)
   * @returns {string} - The summary
   */
  summarize(text, numSentences = 3) {
    if (!text || text.trim().length === 0) {
      return 'No content available for summarization.';
    }

    // Tokenize into sentences
    const sentences = this.sentenceTokenize(text);

    if (sentences.length === 0) {
      return 'Unable to extract sentences from text.';
    }

    // If text is already short, return as is
    if (sentences.length <= numSentences) {
      return sentences.join('. ') + '.';
    }

    // Calculate word frequencies
    const wordFreq = this.calculateWordFrequencies(sentences);

    // Score sentences
    const scoredSentences = this.scoreSentences(sentences, wordFreq);

    // Sort by score and take top N sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => {
        // Re-sort by original order to maintain coherence
        return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
      });

    // Join and return summary
    return topSentences.map(s => s.sentence).join('. ') + '.';
  }

  /**
   * Summarize with length constraints
   * @param {string} text - The text to summarize
   * @param {number} maxLength - Maximum length in characters
   * @returns {string} - The summary
   */
  summarizeByLength(text, maxLength = 200) {
    if (!text || text.trim().length === 0) {
      return 'No content available for summarization.';
    }

    const sentences = this.sentenceTokenize(text);
    
    if (sentences.length === 0) {
      return 'Unable to extract sentences from text.';
    }

    // If text is already short enough
    if (text.length <= maxLength) {
      return text;
    }

    const wordFreq = this.calculateWordFrequencies(sentences);
    const scoredSentences = this.scoreSentences(sentences, wordFreq)
      .sort((a, b) => b.score - a.score);

    let summary = '';
    const selectedSentences = [];

    for (const item of scoredSentences) {
      const potentialSummary = [...selectedSentences, item.sentence]
        .sort((a, b) => sentences.indexOf(a) - sentences.indexOf(b))
        .join('. ') + '.';

      if (potentialSummary.length <= maxLength) {
        selectedSentences.push(item.sentence);
        summary = potentialSummary;
      } else {
        break;
      }
    }

    return summary || sentences[0] + '.';
  }
}

module.exports = new TextSummarizer();
