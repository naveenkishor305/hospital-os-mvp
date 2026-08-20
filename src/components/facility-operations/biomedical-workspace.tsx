"use client";

import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { useState } from "react";

import {
  AssetLifecycleRecord,
  Button,
  ComplianceCountdown,
  Panel,
  PanelBody,
  PanelHeader,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import { prototypeBiomedicalAssets, type BiomedicalAsset } from "@/data/facility-operations/biomedical";

export function BiomedicalWorkspace() {
  const [assets, setAssets] = useState<BiomedicalAsset[]>(prototypeBiomedicalAssets);

  const overdueCount = assets.filter((asset) => asset.overdue).length;
  const dueSoonCount = assets.filter((asset) => asset.stage === "maintenance-due").length;

  function completeService(assetId: string) {
    setAssets((current) =>
      current.map((asset) =>
        asset.assetId === assetId
          ? {
              ...asset,
              stage: "in-service",
              overdue: false,
              nextActionLabel: asset.nextActionLabel,
              nextActionDue: "completed just now — next due in 90 days",
            }
          : asset,
      ),
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Biomedical engineering"
        title="Equipment lifecycle & calibration"
        description="Registered clinical assets tracked from commissioning through preventive maintenance, calibration and retirement."
      />

      <MetricsRow
        metrics={[
          { label: "Assets tracked", value: String(assets.length), icon: Wrench, tone: "information", detail: "Across ICU, ED and wards" },
          { label: "Maintenance due", value: String(dueSoonCount), icon: Wrench, tone: dueSoonCount > 0 ? "warning" : "success", detail: "PM service window open" },
          { label: "Overdue calibration", value: String(overdueCount), icon: AlertTriangle, tone: overdueCount > 0 ? "critical" : "success", detail: "Needs immediate action" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Asset lifecycle
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Registered biomedical equipment
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.assetId}>
              <AssetLifecycleRecord
                assetName={asset.assetName}
                assetId={asset.assetId}
                stage={asset.stage}
                location={asset.location}
                nextAction={
                  <ComplianceCountdown
                    label={asset.nextActionLabel}
                    dueText={asset.nextActionDue}
                    overdue={asset.overdue}
                  />
                }
              />
              {asset.stage === "maintenance-due" || asset.overdue ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  startIcon={<CheckCircle2 aria-hidden="true" size={14} />}
                  onClick={() => completeService(asset.assetId)}
                >
                  Complete service
                </Button>
              ) : null}
            </div>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
