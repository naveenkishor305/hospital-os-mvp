"use client";

import { CheckCircle2, Shirt } from "lucide-react";
import { useState } from "react";

import { Button, InventoryLevelGauge, Panel, PanelBody, PanelHeader, StatusBadge } from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import { prototypeLinenLevels, prototypeLinenRequests, type LinenRequest } from "@/data/facility-operations/linen";

export function LinenWorkspace() {
  const [requests, setRequests] = useState<LinenRequest[]>(prototypeLinenRequests);
  const belowMin = prototypeLinenLevels.filter((item) => item.current < item.min).length;

  function requestReplenishment(label: string) {
    setRequests((current) => [
      { id: `lr-${Date.now()}`, item: label, quantity: "Standard restock", ward: "Central linen store", status: "requested" },
      ...current,
    ]);
  }

  function fulfillRequest(id: string) {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status: "fulfilled" } : request)));
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Linen & laundry management"
        title="Linen inventory & distribution"
        description="Par-level linen inventory and ward distribution requests, using the same inventory gauge as clinical supply chain."
      />

      <MetricsRow
        metrics={[
          { label: "Below par level", value: String(belowMin), icon: Shirt, tone: belowMin > 0 ? "warning" : "success", detail: "Replenishment recommended" },
          { label: "Open distribution requests", value: String(requests.filter((r) => r.status === "requested").length), icon: Shirt, tone: "information", detail: "Ward-level requests" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Par level status</p>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-5 sm:grid-cols-1">
          {prototypeLinenLevels.map((item) => (
            <div key={item.id}>
              <InventoryLevelGauge {...item} />
              {item.current < item.min ? (
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => requestReplenishment(item.label)}>
                  Request replenishment
                </Button>
              ) : null}
            </div>
          ))}
        </PanelBody>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Ward distribution requests</p>
          </div>
          <StatusBadge>{requests.length} requests</StatusBadge>
        </PanelHeader>
        <ul aria-label="Linen distribution requests">
          {requests.map((request) => (
            <li key={request.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">{request.item}</p>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {request.quantity} · {request.ward}
                  </p>
                </div>
                {request.status === "requested" ? (
                  <Button size="sm" variant="secondary" onClick={() => fulfillRequest(request.id)}>
                    Mark fulfilled
                  </Button>
                ) : (
                  <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
                    Fulfilled
                  </StatusBadge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
