package com.knowledgeassistant.service;

import com.knowledgeassistant.model.ChatMessage;
import com.theokanning.openai.OpenAiService;
import com.theokanning.openai.completion.CompletionRequest;
import com.theokanning.openai.completion.CompletionResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final OpenAiService openAiService;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    public AIService() {
        // Initialize with a placeholder API key
        // In production, this should be properly initialized after the apiKey is set
        this.openAiService = new OpenAiService("placeholder-key");
    }

    @Value("${openai.api.key}")
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
        // Reinitialize the service with the actual API key
        this.openAiService = new OpenAiService(apiKey);
    }

    public String generateResponse(String message, String category, String fileContext, boolean deepThinkMode, List<ChatMessage> conversationHistory) {
        // Build context from conversation history
        StringBuilder contextBuilder = new StringBuilder();
        
        // Add category-specific context
        contextBuilder.append(getCategoryContext(category));
        
        // Add file context if available
        if (fileContext != null && !fileContext.isEmpty()) {
            contextBuilder.append("\n\nFile Information:\n").append(fileContext);
        }
        
        // Add conversation history (last 10 messages to stay within token limits)
        if (conversationHistory != null && !conversationHistory.isEmpty()) {
            int startIndex = Math.max(0, conversationHistory.size() - 10);
            List<ChatMessage> recentMessages = conversationHistory.subList(startIndex, conversationHistory.size());
            
            contextBuilder.append("\n\nConversation History:\n");
            for (ChatMessage msg : recentMessages) {
                contextBuilder.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
            }
        }
        
        // Add the current user message
        contextBuilder.append("\n\nUser: ").append(message);
        
        // Set parameters based on deep think mode
        double temperature = deepThinkMode ? 0.3 : 0.7;
        int maxTokens = deepThinkMode ? 1000 : 500;
        
        // Create the completion request
        CompletionRequest completionRequest = CompletionRequest.builder()
                .prompt(contextBuilder.toString())
                .model(model)
                .temperature(temperature)
                .maxTokens(maxTokens)
                .topP(1.0)
                .frequencyPenalty(0.0)
                .presencePenalty(0.0)
                .build();
        
        // Get the completion
        CompletionResult completionResult = openAiService.createCompletion(completionRequest);
        
        // Extract and return the response text
        return completionResult.getChoices().get(0).getText().trim();
    }

    public String processFiles(List<Map<String, Object>> files) {
        // In a real implementation, this would process the uploaded files
        // For now, we'll just return a placeholder
        StringBuilder fileContext = new StringBuilder();
        
        for (Map<String, Object> file : files) {
            String fileName = (String) file.get("name");
            String fileType = (String) file.get("type");
            
            fileContext.append("File: ").append(fileName).append(" (").append(fileType).append(")\n");
            
            // In a real implementation, you would extract text content from the file here
            // For example:
            // if (fileType.startsWith("text/")) {
            //     String content = extractTextFromFile(file);
            //     fileContext.append(content).append("\n\n");
            // }
        }
        
        return fileContext.toString();
    }

    private String getCategoryContext(String category) {
        Map<String, String> categoryContexts = new HashMap<>();
        
        categoryContexts.put("general", "You are a helpful AI assistant with general knowledge. Provide accurate and helpful information on a wide range of topics.");
        categoryContexts.put("academic", "You are an academic assistant. Provide educational content, explain concepts, help with homework, and offer study advice.");
        categoryContexts.put("finance", "You are a financial advisor. Provide information about personal finance, investments, budgeting, and financial planning. Always include a disclaimer that you are not a certified financial advisor.");
        categoryContexts.put("travel", "You are a travel expert. Provide travel recommendations, destination information, travel tips, and planning advice.");
        categoryContexts.put("sports", "You are a sports enthusiast and expert. Provide information about various sports, training tips, game rules, and sports news.");
        
        return categoryContexts.getOrDefault(category, categoryContexts.get("general"));
    }
}