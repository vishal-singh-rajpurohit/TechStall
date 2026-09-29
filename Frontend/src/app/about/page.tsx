import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Cpu, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About TechStall | Computer Accessories & Testing Lab',
  description:
    'Learn about TechStall, our hardware validation benchmarks, warranty guarantees, and dedicated engineering team.',
};

export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
            Our Mission &amp; Standards
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Built by Hardware Geeks for Power Users
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-4 leading-relaxed">
            TechStall was founded to eliminate counterfeit computer accessories, dead pixels, and misleading specs. Every display, laptop, and SSD is rigorously validated.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Lab Validation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every NVMe SSD is speed-benchmarked, and every OLED/IPS panel undergoes colorimeter testing before stocking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Zero Dead-Pixel Policy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We offer instant 30-day screen replacements for even a single bright or dark subpixel on our gaming displays.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct Authorized Hub</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official channel partner with ASUS ROG, Dell, Lenovo, Apple, Samsung, Crucial, Corsair, and Kingston.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm mb-16 space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Our Quality Commitment</h2>
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Founded in 2020 by hardware enthusiasts and competitive overclockers, TechStall started as a specialty boutique testing high-refresh monitors and PCIe NVMe drives. Today, we supply thousands of developers, competitive esports players, and creative studios worldwide.
            </p>
            <p>
              We believe hardware should perform exactly as specified. No thermal throttling surprises, no hidden compromises, and no fine print warranty voids.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors shadow-md"
            >
              <span>Explore Certified Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Contact Our Engineers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
