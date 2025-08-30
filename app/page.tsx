
"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "./components/AppShell";
import { AgentChat } from "./components/AgentChat";
import { LocationCard } from "./components/LocationCard";
import { FilterChips } from "./components/FilterChips";
import { Map } from "./components/Map";
import { ChatMessage, Recommendation, VibeFilter } from "./types";
import { mockRecommendations, mockVibeFilters } from "./lib/mockData";
import { generateLocalRecommendations } from "./lib/openai";
import { MapPin, Sparkles, Plus } from "lucide-react";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "map" | "list">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [vibeFilters, setVibeFilters] = useState<VibeFilter[]>(mockVibeFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Recommendation | null>(null);
  const [userLocation] = useState({ latitude: 40.7589, longitude: -73.9851 }); // Mock NYC location

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Extract request parameters from user message
      const request = {
        location: "New York City", // Default or extract from message
        vibes: vibeFilters.filter(f => f.active).map(f => f.label.toLowerCase()),
        type: content.toLowerCase().includes('restaurant') ? 'restaurant' : 
              content.toLowerCase().includes('bar') ? 'bar' :
              content.toLowerCase().includes('cafe') ? 'cafe' : undefined,
      };

      const response = await generateLocalRecommendations(request);
      
      // Convert AI response to our recommendation format
      const newRecommendations: Recommendation[] = response.recommendations.map((rec, index) => ({
        recommendationId: `ai-${Date.now()}-${index}`,
        name: rec.name,
        address: rec.address,
        type: rec.type as any,
        vibeTags: rec.vibes,
        socialSentimentScore: response.confidence,
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.02,
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.02,
        timestamp: new Date().toISOString(),
        description: rec.description,
        priceRange: "$$" as any,
        openNow: Math.random() > 0.3,
      }));

      setRecommendations(prev => [...newRecommendations, ...prev]);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Found ${newRecommendations.length} amazing spots for you! I've added them to your map and list. ${newRecommendations[0]?.name} looks particularly promising based on social buzz.`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setActiveTab("map");

    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm having trouble finding new spots right now, but check out the existing recommendations I have for you!",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [vibeFilters, userLocation]);

  const handleFilterToggle = useCallback((filterId: string) => {
    setVibeFilters(prev => prev.map(filter => 
      filter.id === filterId 
        ? { ...filter, active: !filter.active }
        : filter
    ));
  }, []);

  const filteredRecommendations = recommendations.filter(rec => {
    const activeFilters = vibeFilters.filter(f => f.active);
    if (activeFilters.length === 0) return true;
    
    return activeFilters.some(filter => 
      rec.vibeTags.some(tag => 
        tag.toLowerCase().includes(filter.label.toLowerCase()) ||
        filter.label.toLowerCase().includes(tag.toLowerCase())
      )
    );
  });

  const saveFrameButton = context && !context.client.added ? (
    <button
      onClick={handleAddFrame}
      className="btn-accent px-3 py-1 text-sm"
    >
      <Plus className="w-4 h-4 mr-1" />
      Save
    </button>
  ) : frameAdded ? (
    <div className="flex items-center gap-1 text-accent text-sm">
      <Sparkles className="w-4 h-4" />
      <span>Saved</span>
    </div>
  ) : null;

  return (
    <AppShell>
      <div className="py-4">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="display text-textPrimary">LocalVibe AI</h1>
              <p className="text-textSecondary text-sm">Stop doomscrolling for local recs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Wallet className="z-10">
              <ConnectWallet>
                <Name className="text-inherit" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
            {saveFrameButton}
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "chat", label: "Chat", icon: Sparkles },
            { id: "map", label: "Map", icon: MapPin },
            { id: "list", label: "List", icon: null },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === id
                  ? "bg-accent text-white"
                  : "bg-surface text-textSecondary hover:text-textPrimary"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterChips 
            filters={vibeFilters} 
            onFilterToggle={handleFilterToggle}
            variant="selectable"
          />
        </div>

        {/* Main Content */}
        <main className="space-y-6">
          {activeTab === "chat" && (
            <AgentChat
              messages={messages}
              onSendMessage={handleSendMessage}
              variant="withTools"
              isLoading={isLoading}
            />
          )}

          {activeTab === "map" && (
            <Map
              recommendations={filteredRecommendations}
              userLocation={userLocation}
              onLocationSelect={setSelectedLocation}
            />
          )}

          {activeTab === "list" && (
            <div className="space-y-4">
              {filteredRecommendations.map((rec) => (
                <LocationCard
                  key={rec.recommendationId}
                  recommendation={rec}
                  onClick={() => setSelectedLocation(rec)}
                />
              ))}
              {filteredRecommendations.length === 0 && (
                <div className="card text-center py-8">
                  <p className="text-textSecondary">No spots match your current filters.</p>
                  <p className="text-textSecondary text-sm mt-1">Try adjusting your vibe preferences!</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Location Detail */}
          {selectedLocation && (
            <div className="space-y-4">
              <LocationCard
                recommendation={selectedLocation}
                variant="default"
              />
              <div className="flex gap-2">
                <button 
                  className="btn-primary flex-1"
                  onClick={() => openUrl(`https://maps.google.com/search/${encodeURIComponent(selectedLocation.address)}`)}
                >
                  Get Directions
                </button>
                <button 
                  className="btn-accent px-4"
                  onClick={() => setSelectedLocation(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-4 text-center">
          <button
            onClick={() => openUrl("https://base.org/builders/minikit")}
            className="text-textSecondary text-xs hover:text-textPrimary transition-colors"
          >
            Built on Base with MiniKit
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
