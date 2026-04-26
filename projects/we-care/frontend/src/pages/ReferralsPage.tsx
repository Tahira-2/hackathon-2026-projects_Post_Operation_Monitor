import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ReferralTable } from "../components/referrals/ReferralTable";
import { Button } from "../components/ui/Button";
import { queryKeys } from "../lib/query-keys";
import {
  DEFAULT_REFERRAL_VIEW,
  REFERRAL_VIEW_LABELS,
  normalizeReferralViewType,
} from "../lib/referral-view";
import { getReferrals } from "../lib/referrals-api";

export default function ReferralsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const viewType = normalizeReferralViewType(
    searchParams.get("type") ?? DEFAULT_REFERRAL_VIEW,
  );
  const pageSize = 10;

  const referralsQuery = useQuery({
    queryKey: queryKeys.referrals(viewType, page, pageSize),
    queryFn: () => getReferrals(viewType, page, pageSize),
  });

  const { title, subtitle } = REFERRAL_VIEW_LABELS[viewType];
  const doctorColumnLabel =
    viewType === "outbound" ? "Target Doctor" : "Referred By";

  return (
    <div className="space-y-5" key={viewType}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
        <Button onClick={() => navigate("/referrals/new")}>
          <Plus size={15} />
          New Referral
        </Button>
      </div>

      {referralsQuery.isLoading ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-8 text-sm text-muted shadow-sm">
          Loading referrals...
        </div>
      ) : referralsQuery.isError || !referralsQuery.data ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-8 text-sm text-muted shadow-sm">
          Unable to load referrals right now.
        </div>
      ) : (
        <ReferralTable
          referrals={referralsQuery.data.items}
          total={referralsQuery.data.total}
          onView={(id) => navigate(`/referrals/${id}`)}
          doctorColumnLabel={doctorColumnLabel}
          emptyMessage={`No ${viewType} referrals match your search.`}
          pagination={{
            page: referralsQuery.data.page,
            totalPages: referralsQuery.data.totalPages,
            onPrevious: () =>
              setPage((currentPage) => Math.max(1, currentPage - 1)),
            onNext: () =>
              setPage((currentPage) =>
                Math.min(
                  referralsQuery.data?.totalPages ?? currentPage,
                  currentPage + 1,
                ),
              ),
          }}
        />
      )}
    </div>
  );
}
