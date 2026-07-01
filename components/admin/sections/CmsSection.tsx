"use client";

import { useState } from "react";
import { Image as ImageIcon, Megaphone, Newspaper, Save, Type } from "lucide-react";
import { Button, Panel, PanelHeader } from "../ui/primitives";
import { LiveCMSSection } from "./LiveCMSSection";

type Tab = "hero" | "banners" | "blog" | "announcements";

const tabs: { id: Tab; label: string; icon: typeof Type }[] = [
  { id: "hero", label: "Hero & Text", icon: Type },
  { id: "banners", label: "Promo Banners", icon: ImageIcon },
  { id: "blog", label: "Blog Posts", icon: Newspaper },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

export function CmsSection() {
  const [tab, setTab] = useState<Tab>("hero");
  const [heroTitle, setHeroTitle] = useState("Import from China Made Easy");
  const [heroSub, setHeroSub] = useState(
    "Connect with trusted suppliers, warehouses, drivers, and logistics services in one powerful platform."
  );
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* LIVE — cms_content editor bound to Supabase */}
      <LiveCMSSection />

      <Panel>
      <PanelHeader title="Public Home Page Content" description="Update live site assets and copy" />
      <div className="flex flex-wrap gap-1.5 border-b border-navy-100 px-5 py-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              tab === id ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "hero" && (
          <div className="max-w-2xl space-y-4">
            <div>
              <label htmlFor="hero-title" className="mb-1.5 block text-sm font-medium text-navy-800">Hero Heading</label>
              <input
                id="hero-title"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              />
            </div>
            <div>
              <label htmlFor="hero-sub" className="mb-1.5 block text-sm font-medium text-navy-800">Hero Subheading</label>
              <textarea
                id="hero-sub"
                rows={3}
                value={heroSub}
                onChange={(e) => setHeroSub(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-navy-800">Hero Background Asset</span>
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 py-8 text-sm text-navy-500">
                <ImageIcon className="h-5 w-5" aria-hidden="true" />
                Drop image/video or click to upload
              </div>
            </div>
          </div>
        )}

        {tab === "banners" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {["Summer Import Sale", "New Supplier Onboarding"].map((b) => (
              <div key={b} className="rounded-lg border border-navy-100 p-4">
                <div className="mb-3 flex h-24 items-center justify-center rounded-md bg-gradient-to-br from-navy-800 to-navy-950 text-white/30">
                  <ImageIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-navy-900">{b}</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">Unpublish</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "blog" && (
          <p className="py-8 text-center text-sm text-navy-400">Blog post editor — create and manage articles for the public site.</p>
        )}
        {tab === "announcements" && (
          <p className="py-8 text-center text-sm text-navy-400">Official announcements feed editor.</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-navy-100 pt-4">
          {saved && <span role="status" className="text-sm font-medium text-emerald-600">Changes published to the live site.</span>}
          <Button onClick={save}><Save className="h-4 w-4" aria-hidden="true" />Save & Publish</Button>
        </div>
      </div>
    </Panel>
    </div>
  );
}
