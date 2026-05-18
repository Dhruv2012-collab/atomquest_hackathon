'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(' ');
}

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const FlowSection: React.FC<FlowSectionProps> = ({
  className,
  style = {},
  children,
  'aria-label': ariaLabel,
}) => (
  <section
    data-flow-section
    aria-label={ariaLabel}
    className={cx(
      'relative min-h-screen w-full overflow-hidden',
      className,
    )}
  >
    <div
      className={cx(
        'flow-art-container relative flex min-h-screen w-full flex-col justify-between overflow-hidden px-[6vw] py-[4vw]',
      )}
      style={{ transformOrigin: 'bottom left', ...style }}
    >
      {children}
    </div>
  </section>
);

export interface FlowArtProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const childCount = (children: React.ReactNode) =>
  React.Children.count(children);

const FlowArt: React.FC<FlowArtProps> = ({
  children,
  className,
  'aria-label': ariaLabel = 'Story Scroll',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);

    update();

    mq.addEventListener('change', update);

    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          '[data-flow-section]',
        ),
      );

      const triggers: ScrollTrigger[] = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector<HTMLElement>(
          '.flow-art-container',
        );

        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, {
            rotation: 18,
            transformOrigin: 'bottom left',
          });

          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 25%',
              scrub: true,
            },
          });

          if (tween.scrollTrigger) {
            triggers.push(tween.scrollTrigger);
          }
        }

        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
            }),
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    {
      scope: containerRef,
      dependencies: [childCount(children), reducedMotion],
    },
  );

  return (
    <main
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx('w-full overflow-x-hidden bg-black', className)}
    >
      {children}
    </main>
  );
};

function GridLines() {
  return (
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }}
    />
  );
}

function Glow() {
  return (
    <>
      <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />
    </>
  );
}

function FloatingLine() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-[10%] top-[20%] h-px w-[300px] rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute right-[5%] top-[40%] h-px w-[500px] -rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-[20%] left-[20%] h-px w-[400px] rotate-6 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export default function AtomQuestLanding() {
  return (
    <FlowArt>
      {/* HERO */}

      <FlowSection
        style={{
          background: '#000000',
          color: '#fff',
        }}
      >
        <Glow />
        <GridLines />
        <FloatingLine />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.3em] text-white/50 font-bold">
              AtomQuest Performance System
            </p>

            <Link href="/login" className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-xl hover:bg-white/20 transition-colors">
              Open Platform
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mt-12 mb-12">
            <div className="flex flex-col justify-center">
              <h1 className="text-[clamp(3rem,6vw,7rem)] font-black uppercase leading-[0.9] tracking-tight break-words">
                ALIGN
                <br />
                HUMAN
                <br />
                EXECUTION
              </h1>

              <p className="mt-8 max-w-[500px] text-lg lg:text-xl leading-relaxed text-white/70">
                Organizations don’t fail because people stop working.
                <br />
                They fail because teams stop seeing how their work connects.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
                  Platform Purpose
                </p>

                <div className="space-y-4 text-base lg:text-lg leading-relaxed text-white/80">
                  <p>
                    Traditional performance management is fragmented across
                    disconnected systems.
                  </p>

                  <p className="font-medium text-white/60">
                    Employees lose visibility.
                    <br />
                    Managers lose alignment.
                    <br />
                    HR loses clarity.
                  </p>

                  <p>
                    This platform transforms goal tracking into a connected,
                    real-time organizational system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.2em] text-white/40">
            <p>Continuous Performance Management</p>
            <p>Enterprise Goal Intelligence</p>
          </div>
        </div>
      </FlowSection>

      {/* PROBLEM */}

      <FlowSection
        style={{
          background: '#f8f8f4',
          color: '#000',
        }}
      >
        <div className="absolute right-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-red-200/40 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/40">
            01 / The Breakdown
          </p>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mt-12 mb-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-[clamp(3rem,6vw,7rem)] font-black uppercase leading-[0.9] tracking-tight break-words">
                WORK
                <br />
                WITHOUT
                <br />
                VISIBILITY
              </h2>
            </div>

            <div className="flex flex-col justify-center">
              <div className="space-y-12">
                <div className="border-l-2 border-black/10 pl-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    Fragmented execution
                  </p>

                  <p className="mt-3 text-xl lg:text-2xl leading-relaxed text-black/80 font-medium">
                    Goals exist in isolated systems with no shared operational
                    visibility.
                  </p>
                </div>

                <div className="border-l-2 border-black/10 pl-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    Delayed feedback
                  </p>

                  <p className="mt-3 text-xl lg:text-2xl leading-relaxed text-black/80 font-medium">
                    Performance reviews happen too late to improve execution in
                    real time.
                  </p>
                </div>

                <div className="border-l-2 border-black/10 pl-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    No organizational alignment
                  </p>

                  <p className="mt-3 text-xl lg:text-2xl leading-relaxed text-black/80 font-medium">
                    Employees cannot see how individual work contributes to
                    larger strategic outcomes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <p className="max-w-[600px] text-right text-base lg:text-lg leading-relaxed text-black/50 font-medium">
              Modern organizations require continuous performance management
              instead of annual ceremonies.
            </p>
          </div>
        </div>
      </FlowSection>

      {/* SYSTEM */}

      <FlowSection
        style={{
          background: '#000000',
          color: '#fff',
        }}
      >
        <Glow />
        <GridLines />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">
            02 / The System
          </p>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mt-12 mb-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-[clamp(3rem,6vw,7rem)] font-black uppercase leading-[0.9] tracking-tight break-words">
                FROM
                <br />
                GOALS
                <br />
                TO
                <br />
                EXECUTION
              </h2>
            </div>

            <div className="flex flex-col justify-center">
              <p className="max-w-[620px] text-xl lg:text-2xl leading-relaxed text-white/70 font-medium">
                The platform creates a continuous operational rhythm between
                employees, managers, HR, and leadership through structured goal
                management and real-time visibility.
              </p>

              <div className="mt-12 grid gap-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    Goal Lifecycle
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.15em] text-white/80 font-medium">
                    <span>Goal Creation</span>
                    <span className="text-white/20">/</span>
                    <span>Approval Workflow</span>
                    <span className="text-white/20">/</span>
                    <span>Quarterly Check-ins</span>
                    <span className="text-white/20">/</span>
                    <span>Achievement Tracking</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    Governance Engine
                  </p>

                  <p className="mt-4 text-base lg:text-lg leading-relaxed text-white/70">
                    Validation rules, approval locks, escalation workflows, and
                    audit trails enforce operational consistency across the
                    organization.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.2em] text-white/40">
            <p>Continuous Alignment</p>
            <p>Quarterly Intelligence</p>
          </div>
        </div>
      </FlowSection>

      {/* STACK */}

      <FlowSection
        style={{
          background: '#1d4ed8',
          color: '#fff',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
            03 / Architectural Foundation
          </p>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mt-12 mb-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-[clamp(3rem,6vw,7rem)] font-black uppercase leading-[0.9] tracking-tight break-words">
                BUILT
                <br />
                FOR
                <br />
                SCALE
              </h2>
            </div>

            <div className="flex flex-col justify-center">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [
                    'Frontend',
                    'Next.js 16, App Router, React Components',
                  ],
                  [
                    'Design System',
                    'Tailwind CSS, Shadcn UI, GSAP',
                  ],
                  [
                    'Backend',
                    'Supabase PostgreSQL, Realtime API',
                  ],
                  [
                    'Identity',
                    'Enterprise Authentication Integration',
                  ],
                  [
                    'Governance',
                    'Row Level Security, Audit Trails',
                  ],
                  [
                    'Deployment',
                    'Vercel Serverless Infrastructure',
                  ],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/10 transition-colors"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                      {title}
                    </p>

                    <p className="mt-3 text-base lg:text-lg leading-snug text-white/90 font-medium">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right text-xs lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.2em] text-white/40">
            Product-Led Enterprise Engineering
          </div>
        </div>
      </FlowSection>

      {/* OPERATING MODEL */}

      <FlowSection
        style={{
          background: '#ffffff',
          color: '#000',
        }}
      >
        <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/50 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/40">
            04 / Operating Model
          </p>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mt-12 mb-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-[clamp(3rem,6vw,7rem)] font-black uppercase leading-[0.9] tracking-tight break-words">
                CONTINUOUS
                <br />
                PERFORMANCE
              </h2>
            </div>

            <div className="flex flex-col justify-center">
              <div className="space-y-12">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    Real-time visibility
                  </p>

                  <p className="mt-3 text-xl lg:text-2xl leading-relaxed text-black/80 font-medium">
                    Managers track progress continuously instead of waiting for
                    annual review cycles.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    Structured governance
                  </p>

                  <p className="mt-3 text-xl lg:text-2xl leading-relaxed text-black/80 font-medium">
                    Calendar windows, approval locks, and escalation rules
                    ensure operational accountability.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    Organizational intelligence
                  </p>

                  <p className="mt-3 text-xl lg:text-2xl leading-relaxed text-black/80 font-medium">
                    Analytics transform employee progress into measurable
                    execution insight across teams and departments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.2em] text-black/40">
            <p>Execution Visibility</p>
            <p>Strategic Alignment</p>
          </div>
        </div>
      </FlowSection>

      {/* FINAL CTA */}

      <FlowSection
        style={{
          background: '#000000',
          color: '#fff',
        }}
      >
        <Glow />
        <GridLines />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div />

          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-[clamp(3rem,8vw,9rem)] font-black uppercase leading-[0.9] tracking-tight break-words">
              ALIGN
              <br />
              EVERY
              <br />
              TEAM
            </h2>

            <p className="mt-8 max-w-[700px] text-lg lg:text-2xl leading-relaxed text-white/70 font-medium">
              A connected enterprise system designed to transform fragmented
              execution into measurable organizational progress.
            </p>

            <div className="mt-12">
              <Link href="/login" className="inline-block rounded-full bg-white px-10 py-4 text-base lg:text-lg font-bold text-black shadow-xl hover:scale-105 hover:bg-gray-100 transition-all duration-300">
                Launch Platform
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs lg:text-sm uppercase tracking-[0.1em] lg:tracking-[0.2em] text-white/40">
            <p>AtomQuest Goal Tracking Portal</p>
            <p>Next.js • Supabase</p>
          </div>
        </div>
      </FlowSection>
    </FlowArt>
  );
}
