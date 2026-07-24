import type { PublicUnitDetail } from "@/lib/data/public-units";
import { formatYen, formatArea, formatDate, formatYearMonth, formatWalkMinutes, splitTags } from "@/lib/format";
import { CONTRACT_TYPE_LABEL, TAX_TYPE_LABEL, TRANSACTION_TYPE_LABEL } from "@/lib/constants";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 py-2.5 sm:flex-row sm:gap-4">
      <dt className="w-full shrink-0 text-sm text-neutral-500 sm:w-40">{label}</dt>
      <dd className="text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

export function InitialCostTable({ unit }: { unit: PublicUnitDetail }) {
  return (
    <dl>
      <Row label="敷金" value={formatYen(unit.deposit)} />
      <Row label="礼金" value={formatYen(unit.keyMoney)} />
      <Row label="保証金" value={formatYen(unit.guaranteeDeposit)} />
      <Row label="償却" value={formatYen(unit.amortization)} />
      <Row label="保証会社費用" value={formatYen(unit.guarantorCompanyFee)} />
      <Row label="火災保険料" value={formatYen(unit.fireInsuranceFee)} />
      <Row label="鍵交換費用" value={formatYen(unit.keyExchangeFee)} />
      <Row label="クリーニング費用" value={formatYen(unit.cleaningFee)} />
      <Row label="更新料" value={formatYen(unit.renewalFee)} />
      {unit.otherCosts.map((cost) => (
        <Row
          key={cost.id}
          label={cost.name}
          value={
            <>
              {formatYen(cost.amount)}
              <span className="ml-2 text-xs text-neutral-500">
                ({TAX_TYPE_LABEL[cost.taxType as keyof typeof TAX_TYPE_LABEL] ?? cost.taxType}・
                {cost.isRequired ? "必須" : "任意"})
              </span>
              {cost.remarks && <span className="ml-2 text-xs text-neutral-500">{cost.remarks}</span>}
            </>
          }
        />
      ))}
    </dl>
  );
}

export function OverviewTable({ unit }: { unit: PublicUnitDetail }) {
  const building = unit.building;
  const address =
    building.addressDisclosureLevel === "CITY_ONLY"
      ? `${building.prefecture}${building.city}`
      : `${building.prefecture}${building.city}${building.addressLine}${building.addressLine2 ?? ""}`;

  return (
    <dl>
      <Row label="所在地" value={address} />
      <Row
        label="交通"
        value={
          <ul className="space-y-1">
            {building.stations.map((s) => (
              <li key={s.id}>
                {s.lineName} {s.stationName} {formatWalkMinutes(s.walkMinutes)}
                {s.busMinutes ? `(バス${s.busMinutes}分)` : ""}
              </li>
            ))}
          </ul>
        }
      />
      <Row label="構造" value={building.structure} />
      <Row label="総階数" value={`地上${building.totalFloors}階建`} />
      <Row label="所在階" value={unit.floor ? `${unit.floor}階` : "-"} />
      <Row label="築年月" value={formatYearMonth(building.builtYearMonth)} />
      <Row label="専有面積" value={formatArea(unit.exclusiveArea)} />
      <Row label="間取り" value={unit.layoutType} />
      <Row label="方角" value={unit.direction || "-"} />
      <Row label="契約期間" value={unit.contractPeriod || "-"} />
      <Row
        label="契約形態"
        value={unit.contractType ? CONTRACT_TYPE_LABEL[unit.contractType as keyof typeof CONTRACT_TYPE_LABEL] : "-"}
      />
      <Row
        label="取引態様"
        value={
          unit.transactionType
            ? TRANSACTION_TYPE_LABEL[unit.transactionType as keyof typeof TRANSACTION_TYPE_LABEL]
            : "-"
        }
      />
    </dl>
  );
}

export function EquipmentTags({ unit }: { unit: PublicUnitDetail }) {
  if (unit.equipment.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {unit.equipment.map(({ equipment }) => (
        <li
          key={equipment.id}
          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700"
        >
          {equipment.name}
        </li>
      ))}
    </ul>
  );
}

export function AdInfoTable({ unit, company }: { unit: PublicUnitDetail; company: { name: string; licenseNumber: string; associations: string } }) {
  return (
    <dl>
      <Row label="情報公開日" value={formatDate(unit.publishedAt)} />
      <Row label="最終更新日" value={formatDate(unit.lastUpdatedAt)} />
      <Row label="次回更新予定日" value={formatDate(unit.nextUpdateDueAt)} />
      <Row label="広告主" value={company.name} />
      <Row label="宅建業免許番号" value={company.licenseNumber} />
      {company.associations && <Row label="所属団体" value={company.associations} />}
      <Row
        label="取引態様"
        value={
          unit.transactionType
            ? TRANSACTION_TYPE_LABEL[unit.transactionType as keyof typeof TRANSACTION_TYPE_LABEL]
            : "-"
        }
      />
    </dl>
  );
}

export function FeatureTagList({ tags }: { tags: string | null }) {
  const list = splitTags(tags);
  if (list.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {list.map((tag) => (
        <li key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {tag}
        </li>
      ))}
    </ul>
  );
}
