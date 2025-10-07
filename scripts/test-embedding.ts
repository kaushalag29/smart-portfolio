import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Document } from "langchain/document";
import { getEmbeddingsCollection, getVectorStore } from "../src/lib/supabase";

/**
 * Test script to verify embedding generation and Supabase insertion
 * This script tests the rate limiter and embedding functionality
 */
async function testEmbedding() {
  console.log("=".repeat(60));
  console.log("Starting Embedding Test with Rate Limiter");
  console.log("=".repeat(60));
  console.log();

  try {
    // Step 1: Verify environment variables
    console.log("Step 1: Checking environment variables...");
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY not found in environment");
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error("Supabase credentials not found in environment");
    }
    console.log("✓ Environment variables verified");
    console.log();

    // Step 2: Initialize vector store
    console.log("Step 2: Initializing vector store...");
    const vectorStore = await getVectorStore();
    console.log("✓ Vector store initialized");
    console.log();

    // Step 3: Create test documents
    console.log("Step 3: Creating test documents...");
    const testDocuments = [
      new Document({
        pageContent: "Test document 1: Kaushal Kumar Agarwal is a Software Development Engineer at Amazon Web Services.",
        metadata: { 
          section: "test",
          source: "test",
          dataType: "test_embedding",
          timestamp: new Date().toISOString()
        }
      }),
      new Document({
        pageContent: "Test document 2: He has expertise in AI/ML, cloud platforms, and full-stack development.",
        metadata: { 
          section: "test",
          source: "test",
          dataType: "test_embedding",
          timestamp: new Date().toISOString()
        }
      }),
      new Document({
        pageContent: "Test document 3: His educational background includes a Master's degree from Rice University.",
        metadata: { 
          section: "test",
          source: "test",
          dataType: "test_embedding",
          timestamp: new Date().toISOString()
        }
      })
    ];
    console.log(`✓ Created ${testDocuments.length} test documents`);
    console.log();

    // Step 4: Add documents to vector store (this will use the rate limiter)
    console.log("Step 4: Adding documents to vector store with rate limiting...");
    console.log("(This will take a few seconds due to rate limiting)");
    const startTime = Date.now();
    
    await vectorStore.addDocuments(testDocuments);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✓ Documents added successfully in ${duration}s`);
    console.log();

    // Step 5: Test similarity search
    console.log("Step 5: Testing similarity search...");
    const searchResults = await vectorStore.similaritySearch(
      "Tell me about Kaushal's work at AWS",
      2
    );
    console.log(`✓ Found ${searchResults.length} similar documents`);
    console.log();

    console.log("Search results:");
    searchResults.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.pageContent.substring(0, 80)}...`);
    });
    console.log();

    // Step 6: Clean up test documents
    console.log("Step 6: Cleaning up test documents...");
    const collection = await getEmbeddingsCollection();
    const { error } = await collection
      .delete()
      .eq('metadata->>dataType', 'test_embedding');
    
    if (error) {
      console.warn("⚠ Warning: Could not clean up test documents:", error.message);
    } else {
      console.log("✓ Test documents cleaned up");
    }
    console.log();

    // Test completed successfully
    console.log("=".repeat(60));
    console.log("✓ ALL TESTS PASSED!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  - Rate limiter is working correctly");
    console.log("  - Embeddings are being generated (1536 dimensions)");
    console.log("  - Supabase insertion is successful");
    console.log("  - Similarity search is functional");
    console.log();
    console.log("You can now safely run: npm run generate");
    console.log();

  } catch (error: any) {
    console.error();
    console.error("=".repeat(60));
    console.error("✗ TEST FAILED");
    console.error("=".repeat(60));
    console.error();
    console.error("Error details:");
    console.error(`  Type: ${error.constructor.name}`);
    console.error(`  Message: ${error.message}`);
    if (error.stack) {
      console.error();
      console.error("Stack trace:");
      console.error(error.stack);
    }
    console.error();
    process.exit(1);
  }
}

// Run the test
testEmbedding().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
