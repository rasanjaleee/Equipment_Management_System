import { useEffect, useState } from "react";
import axios from "axios";
import { Package, CheckCircle, Wrench, XCircle } from "lucide-react";

export default function TechnicianDashboard() {
  const [equipmentList, setEquipmentList] = useState([]);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/equipment/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipmentList(res.data);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    }
  };

  const total = equipmentList.length;
  const working = equipmentList.filter((e) => e.status === "WORKING").length;
  const underRepair = equipmentList.filter((e) => e.status === "UNDER_REPAIR").length;
  const broken = equipmentList.filter((e) => e.status === "BROKEN").length;

  const cards = [
    { title: "Total Equipment", value: total, icon: Package, bg: "bg-white" },
    { title: "Working", value: working, icon: CheckCircle, bg: "bg-green-50" },
    { title: "Under Repair", value: underRepair, icon: Wrench, bg: "bg-blue-50" },
    { title: "Broken", value: broken, icon: XCircle, bg: "bg-red-50" },
  ];

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Technician Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`${card.bg} rounded-2xl shadow-md p-6 border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                </div>
                <Icon size={34} className="text-yellow-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}