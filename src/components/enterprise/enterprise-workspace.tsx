import { BarChart3, Building2, Network, TrendingUp } from "lucide-react";

import {
  HierarchyTree,
  MetricTile,
  Panel,
  PanelBody,
  PanelHeader,
  RankedBarList,
  VarianceIndicator,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeDepartmentVolume,
  prototypeOrgHierarchy,
  prototypeScorecard,
} from "@/data/enterprise";

export function EnterpriseWorkspace() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Enterprise administration & ancillary services analytics"
        title="Enterprise &amp; analytics"
        description="Organizational structure and cross-department performance sit on the same platform as clinical screens — an explorable hierarchy, ranked volume, and an executive scorecard."
      />

      <MetricsRow
        metrics={[
          { label: "Departments", value: "14", icon: Building2, tone: "information", detail: "Across 3 business units" },
          { label: "Active facilities", value: "1", icon: Network, tone: "information", detail: "Multi-site ready" },
          { label: "Executive KPIs tracked", value: String(prototypeScorecard.length), icon: BarChart3, tone: "success", detail: "Updated hourly" },
          { label: "Trending favorably", value: "2 / 4", icon: TrendingUp, tone: "success", detail: "LOS and denial rate improving" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Enterprise administration
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Organization hierarchy
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <HierarchyTree nodes={prototypeOrgHierarchy} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Ancillary services analytics
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Department volume
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <RankedBarList items={prototypeDepartmentVolume} />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Executive scorecard
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Cross-department KPIs
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {prototypeScorecard.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              comparison={
                <VarianceIndicator value={metric.variance} sentiment={metric.sentiment} />
              }
            />
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
