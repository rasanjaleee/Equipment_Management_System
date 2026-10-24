import { useEffect, useMemo, useState } from "react";
import {
  Package,
  CheckCircle2,
  Wrench,
  XCircle,
  Activity,
  Building2,
} from "lucide-react";
import { useData } from "../../context/DataContext";

export default function TechnicianDashboard() {
  const { equipmentList: cachedEquipment, refreshEquipment } = useData();
  const [equipmentList, setEquipmentList] = useState(cachedEquipment || []);

  useEffect(() => {
    if (cachedEquipment && cachedEquipment.length > 0) {
      setEquipmentList(cachedEquipment);
    }
  }, [cachedEquipment]);

  useEffect(() => {
    refreshEquipment(false);
  }, [refreshEquipment]);

  const total = equipmentList.length;

  const working = equipmentList.filter(
    (e) => e.status === "WORKING"
  ).length;

  const underRepair = equipmentList.filter(
    (e) => e.status === "UNDER_REPAIR"
  ).length;

  const broken = equipmentList.filter(
    (e) => e.status === "BROKEN"
  ).length;

  const getPercentage = (value) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const workingPercentage = getPercentage(working);
  const repairPercentage = getPercentage(underRepair);
  const brokenPercentage = getPercentage(broken);

  const cards = [
    {
      title: "Total Equipment",
      value: total,
      subtitle: "Registered equipment",
      icon: Package,
      cardStyle: "bg-amber-50 border-amber-100",
      iconStyle: "bg-amber-500 text-white",
    },
    {
      title: "Working",
      value: working,
      subtitle: `${workingPercentage}% of total`,
      icon: CheckCircle2,
      cardStyle: "bg-green-50 border-green-100",
      iconStyle: "bg-green-500 text-white",
    },
    {
      title: "Under Repair",
      value: underRepair,
      subtitle: `${repairPercentage}% of total`,
      icon: Wrench,
      cardStyle: "bg-blue-50 border-blue-100",
      iconStyle: "bg-blue-500 text-white",
    },
    {
      title: "Broken",
      value: broken,
      subtitle: `${brokenPercentage}% of total`,
      icon: XCircle,
      cardStyle: "bg-red-50 border-red-100",
      iconStyle: "bg-red-500 text-white",
    },
  ];

  const laboratoryData = useMemo(() => {
    const labCounts = {};

    equipmentList.forEach((equipment) => {
      const lab =
        equipment.laboratory ||
        equipment.labName ||
        equipment.lab ||
        "Unassigned";

      labCounts[lab] = (labCounts[lab] || 0) + 1;
    });

    return Object.entries(labCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [equipmentList, total]);

  return (
    <div className="min-h-full">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Technician Dashboard
        </h1>

        <p className="text-sm md:text-base text-gray-500 mt-1">
          Overview of equipment status and laboratory assets.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`${card.cardStyle} rounded-2xl border shadow-sm p-5 transition duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </h2>

                  <p className="text-xs text-gray-500 mt-2">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`${card.iconStyle} w-12 h-12 rounded-full flex items-center justify-center shadow-sm`}
                >
                  <Icon size={24} />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Equipment Status */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center gap-2 mb-6">
            <Activity size={21} className="text-yellow-600" />

            <h2 className="text-lg font-bold text-gray-900">
              Equipment Status Overview
            </h2>
          </div>

          {total === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No equipment data available.
            </div>
          ) : (
            <div className="space-y-6">

              {/* Working */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm font-medium text-gray-700">
                      Working
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {working} ({workingPercentage}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${workingPercentage}%` }}
                  />
                </div>
              </div>

              {/* Under Repair */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-medium text-gray-700">
                      Under Repair
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {underRepair} ({repairPercentage}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${repairPercentage}%` }}
                  />
                </div>
              </div>

              {/* Broken */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm font-medium text-gray-700">
                      Broken
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {broken} ({brokenPercentage}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${brokenPercentage}%` }}
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Equipment by Laboratory */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center gap-2 mb-6">
            <Building2 size={21} className="text-yellow-600" />

            <h2 className="text-lg font-bold text-gray-900">
              Equipment by Laboratory
            </h2>
          </div>

          {laboratoryData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No laboratory equipment data available.
            </div>
          ) : (
            <div className="space-y-5">

              {laboratoryData.map((lab) => (
                <div key={lab.name}>

                  <div className="flex items-start justify-between gap-4 mb-2">

                    <p className="text-sm font-medium text-gray-700 break-words">
                      {lab.name}
                    </p>

                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      {lab.count}
                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${lab.percentage}%` }}
                    />
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}