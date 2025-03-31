// Types for Benefits Data
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadPdfDocuments, documentPdfMapping } from './pdfUtils';
import fs from 'fs';
import path from 'path';

export type HealthPlan = 'HDHP' | 'PPO' | 'HMO' | 'All';
export type BenefitCategory = 'Health' | 'Dental' | 'Vision' | 'Retirement' | 'TimeOff' | 'All';

export interface BenefitDocument {
  id: string;
  title: string;
  content: string;
  category: BenefitCategory;
  plans: HealthPlan[];
  url?: string;
}

// Store our vector store in memory
let vectorStore: MemoryVectorStore | null = null;
// Version to force reinitialization when content changes
const vectorStoreVersion = 4;

// Store our raw benefit documents - only keeping markdown files for non-health plan docs
const benefitDocuments: BenefitDocument[] = [
  {
    id: 'family-medical-leave',
    title: 'Family and Medical Leave Act (FMLA) Policy',
    content: `# Family and Medical Leave Act (FMLA) Policy

## Overview

PulseTel provides eligible employees with up to 12 weeks of unpaid, job-protected leave per year in accordance with the Family and Medical Leave Act of 1993 (FMLA). This policy outlines eligibility requirements, qualifying reasons for leave, and the process for requesting FMLA leave.

## Eligibility

To be eligible for FMLA leave, an employee must meet all of the following criteria:
- Have worked for PulseTel for at least 12 months
- Have worked at least 1,250 hours during the 12-month period immediately preceding the leave
- Work at a location where PulseTel employs at least 50 employees within a 75-mile radius

## Qualifying Reasons for Leave

Eligible employees may take FMLA leave for the following reasons:

1. **Birth and Care of a Newborn Child**
   - Leave must be completed within 12 months of the birth

2. **Placement of a Child for Adoption or Foster Care**
   - Leave must be completed within 12 months of the placement

3. **Care for an Immediate Family Member**
   - Care for a spouse, child, or parent with a serious health condition

4. **Employee's Own Serious Health Condition**
   - When the employee is unable to perform essential job functions due to a serious health condition

5. **Military Family Leave**
   - Qualifying exigency arising from employee's spouse, child, or parent being on covered active duty
   - Care for a servicemember with a serious injury or illness (eligible for up to 26 workweeks)`,
    category: 'TimeOff',
    plans: ['All'],
    url: '/api/test-pdf?file=family-medical-leave.md'
  },
  {
    id: 'ada-accommodations',
    title: 'Americans with Disabilities Act (ADA) Accommodations Policy',
    content: `# Americans with Disabilities Act (ADA) Accommodations Policy

## Purpose

PulseTel is committed to providing equal employment opportunities to qualified individuals with disabilities. This policy outlines the company's procedures for providing reasonable accommodations in compliance with the Americans with Disabilities Act (ADA) and applicable state laws.

## Policy Statement

PulseTel provides reasonable accommodations to qualified individuals with disabilities to enable them to:
- Apply for employment opportunities
- Perform essential job functions
- Enjoy equal benefits and privileges of employment
- Participate in company-sponsored activities

## Definition of Disability

Under the ADA, a person has a disability if they:
1. Have a physical or mental impairment that substantially limits one or more major life activities
2. Have a record of such impairment
3. Are regarded as having such an impairment

Major life activities include, but are not limited to:
- Caring for oneself
- Performing manual tasks
- Seeing, hearing, eating, sleeping
- Walking, standing, lifting, bending
- Speaking, breathing, learning, reading
- Concentrating, thinking, communicating
- Working
- Operation of major bodily functions`,
    category: 'Health',
    plans: ['All'],
    url: '/api/test-pdf?file=ada-accommodations.md'
  }
];

// Initialize vector store with our documents - Force reinitialization
export const initializeVectorStore = async () => {
  // Always reinitialize to pick up changes
  console.log(`Initializing vector store version ${vectorStoreVersion}`);
  vectorStore = null;

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Load the PDF documents
    const pdfDocs = await loadPdfDocuments();
    
    // Combine markdown documents with PDF documents
    const allDocs = [...benefitDocuments, ...pdfDocs];
    
    console.log('Initializing vector store with documents:', allDocs.map(d => ({
      id: d.id,
      title: d.title,
      url: d.url
    })));

    // Process all documents into smaller chunks
    const textSplitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await Promise.all(
      allDocs.map(async (doc) => {
        // Split the content into chunks
        const splitDocs = await textSplitter.createDocuments(
          [doc.content],
          [{ 
            id: doc.id, 
            title: doc.title, 
            category: doc.category, 
            plans: doc.plans.join(','),
            url: doc.url // Include URL in metadata
          }]
        );
        return splitDocs;
      })
    );

    // Flatten the array of arrays
    const flatDocs = docs.flat();

    // Create the vector store
    vectorStore = await MemoryVectorStore.fromDocuments(flatDocs, embeddings);
    return vectorStore;
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
};

// Get benefits by plan
export const getBenefitsByPlan = async (plan: HealthPlan | null) => {
  // Load PDF documents and await the Promise
  const pdfDocs = await loadPdfDocuments();
  
  if (!plan) return [...benefitDocuments, ...pdfDocs];
  
  return [...benefitDocuments, ...pdfDocs].filter(doc => 
    doc.plans.includes(plan) || doc.plans.includes('All')
  );
};

interface SearchOptions {
  employeePlan?: HealthPlan | null;
  category?: BenefitCategory | null;
}

export async function searchBenefits(query: string, options: SearchOptions = {}) {
  // Initialize the vector store if it doesn't exist yet
  if (!vectorStore) {
    await initializeVectorStore();
  }

  if (!vectorStore) {
    throw new Error("Failed to initialize vector store");
  }

  // Detect if this is a health-related query
  const isHealthQuery = /health|medical|doctor|coverage|hospital|copay|deductible|prescription|visit|specialist|benefits|plan|maternity|pregnancy|birth|baby/i.test(query);

  // For health-related queries, modify the query to include the plan name
  let enhancedQuery = query;
  if (isHealthQuery && options.employeePlan && options.employeePlan !== 'All') {
    enhancedQuery = `${options.employeePlan} plan ${query}`;
    console.log(`Enhanced query for plan-specific search: "${enhancedQuery}"`);
  }

  // Search for relevant documents
  let similarDocs = await vectorStore.similaritySearch(enhancedQuery, 5);

  // Filter by plan if specified
  if (options.employeePlan && options.employeePlan !== 'All') {
    // Filter results to only include documents that mention the employee's plan
    similarDocs = similarDocs.filter(doc => {
      const plans = doc.metadata.plans ? doc.metadata.plans.split(',') : [];
      // Prioritize exact plan matches over 'All' plans
      return plans.includes(options.employeePlan);
    });
    
    // If no exact matches, include "All" plan documents
    if (similarDocs.length === 0) {
      similarDocs = await vectorStore.similaritySearch(query, 5);
      similarDocs = similarDocs.filter(doc => {
        const plans = doc.metadata.plans ? doc.metadata.plans.split(',') : [];
        return plans.includes('All');
      });
    }
    
    // Debug logging to verify the plan filtering is working
    console.log(`Filtered to ${similarDocs.length} docs for plan ${options.employeePlan}:`, 
      similarDocs.map(d => ({
        id: d.metadata.id,
        plans: d.metadata.plans,
        title: d.metadata.title
      }))
    );
  }

  // Filter by category if specified
  if (options.category && options.category !== 'All' as BenefitCategory) {
    similarDocs = similarDocs.filter(doc => 
      doc.metadata.category === options.category || doc.metadata.category === 'All'
    );
  }

  return similarDocs;
}

export async function getContextForQuery(query: string, employeePlan: HealthPlan | null = null) {
  try {
    // Get similar documents
    const similarDocs = await searchBenefits(query, { employeePlan });

    // Extract the context from the documents
    const context = similarDocs.map(doc => doc.pageContent).join('\n\n');

    // Extract source documents (de-duplicated)
    const sourceDocIDs = new Set<string>();
    const sourceDocs: { id: string; title: string; url?: string }[] = [];

    for (const doc of similarDocs) {
      if (doc.metadata.id && !sourceDocIDs.has(doc.metadata.id)) {
        sourceDocIDs.add(doc.metadata.id);
        sourceDocs.push({
          id: doc.metadata.id,
          title: doc.metadata.title,
          url: doc.metadata.url
        });
      }
    }

    // For health-related queries, always include the user's plan document
    const isHealthRelated = /health|medical|doctor|coverage|hospital|copay|deductible|prescription|visit|specialist|benefits|plan/i.test(query);
    
    if (isHealthRelated && employeePlan && employeePlan !== 'All') {
      // Get the appropriate plan PDF document ID
      const planDocID = employeePlan === 'HDHP' ? 'high-deductible-plan' : 
                        employeePlan === 'PPO' ? 'ppo-plan' : 
                        employeePlan === 'HMO' ? 'hmo-plan' : null;
      
      // If we have a valid plan document and it's not already included
      if (planDocID && !sourceDocIDs.has(planDocID)) {
        // Get all documents to find this plan doc
        const pdfDocs = await loadPdfDocuments();
        const planDoc = pdfDocs.find(doc => doc.id === planDocID);
        
        if (planDoc) {
          console.log(`Adding ${employeePlan} plan document to sources for health query`);
          sourceDocs.push({
            id: planDoc.id,
            title: planDoc.title,
            url: planDoc.url
          });
        }
      }
    }

    return {
      context,
      sourceDocs
    };
  } catch (error) {
    console.error('Error getting context for query:', error);
    throw error;
  }
} 