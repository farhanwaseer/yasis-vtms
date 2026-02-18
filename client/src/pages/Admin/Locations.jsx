import React, { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  Trash2,
  MapPinned,
  MapPinHouse,
} from "lucide-react";
import GoogleMapView from "../../components/MapView";

const Locations = () => {
  return (
    <div className="mt-8 ">
      <DashboardStats />
      <LocationManagement />
      <GoogleMapView />
    </div>
  );
};

export default Locations;

const DashboardStats = () => {
  const stats = [
    {
      title: "Total Zones",
      value: 3,
      icon: <ZoneIcon size={22} />,
      bg: "bg-orange-100",
      iconBg: "bg-orange-500",
    },
    {
      title: "Total UCs",
      value: 4,
      icon: <MapPinned size={22} />,
      bg: "bg-blue-100",
      iconBg: "bg-blue-500",
    },
    {
      title: "Total Wards",
      value: 2,
      icon: <MapPinHouse size={22} />,
      bg: "bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      title: "Total Bins ",
      value: 2,
      icon: <Trash2 size={22} />,
      bg: "bg-green-100",
      iconBg: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 p-4 gap-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-md hover:shadow-lg  "
        >
          <div>
            <p className="text-gray-500 text-sm">{item.title}</p>
            <h2 className="text-2xl  mt-2">{item.value}</h2>
          </div>

          <div
            className={`w-12 h-12 flex items-center justify-center rounded-xl text-white ${item.iconBg}`}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

const ZoneIcon = ({ size = 32, color = "orange", imageSize = 30 }) => {
  const bgColor = `bg-${color}-500`; // Tailwind dynamic class
  return (
    <div
      className={`${bgColor} rounded-2xl flex items-center justify-center`}
      style={{ width: size, height: size }}
    >
      <img
        src="/place.png" // make sure image is in public folder
        alt="zone icon"
        style={{ width: 40, height: 30 }}
      />
    </div>
  );
};

function LocationManagement() {
  const [openZone, setOpenZone] = useState("zone1");

  const zones = [
    {
      id: "zone1",
      name: "Zone 01",
      ucs: [
        {
          id: 1,
          name: "Union Council 01",
          progress: "8/12 Wards Completed",
          status: "progress",
        },
        {
          id: 2,
          name: "Union Council 02",
          progress: "8/12 Wards Completed",
          status: "progress",
        },
        {
          id: 3,
          name: "Union Council 03",
          progress: "12/12 Wards Completed",
          status: "completed",
        },
      ],
    },
    {
      id: "zone2",
      name: "Zone 02",
      ucs: [
        {
          id: 1,
          name: "Union Council 01",
          progress: "8/12 Wards Completed",
          status: "progress",
        },
        {
          id: 2,
          name: "Union Council 02",
          progress: "8/12 Wards Completed",
          status: "progress",
        },
      ],
    },
  ];

  const toggleZone = (id) => {
    setOpenZone(openZone === id ? null : id);
  };

  return (
    <div className="mt-4 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Location Management</h2>

          <div className="flex gap-3">
            <button className="bg-black text-white px-5 py-2 rounded-xl">
              + Add Zone
            </button>
            <button className="bg-gray-200 px-5 py-2 rounded-xl">
              + Add UCs
            </button>
            <button className="bg-gray-200 px-5 py-2 rounded-xl">
              + Add Wards
            </button>
            <button className="bg-gray-200 px-5 py-2 rounded-xl">
              + Add Bins
            </button>
          </div>
        </div>

        {/* Zones */}
        <div className="space-y-4">  
          {zones.map((zone) => (
            <div key={zone.id} className="border border-gray-300 hover:shadow-md rounded-2xl bg-gray-50">
              {/* Zone Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-3 rounded-xl">
                    <MapPin size={22} />
                  </div>
                  <h3 className="text-lg font-semibold">{zone.name}</h3>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={() => toggleZone(zone.id)}>
                    {openZone === zone.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                  <Pencil size={18} className="cursor-pointer" />
                  <Trash2 size={18} className="text-red-500 cursor-pointer" />
                </div>
              </div>

              {/* UC List */}
              {openZone === zone.id && zone.ucs.length > 0 && (
                <div className="px-8 pb-4 space-y-3">
                  {zone.ucs.map((uc) => (
                    <div
                      key={uc.id}
                      className="bg-white border border-gray-300 rounded-xl px-5 py-4 flex items-center justify-between shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-xl">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="font-medium">{uc.name}</p>
                          <p className="text-xs text-gray-500">{uc.progress}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        {uc.status === "progress" ? (
                          <span className="px-4 py-1 text-xs rounded-full border border-red-400 text-red-500">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-4 py-1 text-xs rounded-full border border-green-500 text-green-600">
                            Completed
                          </span>
                        )}

                        <Pencil size={16} className="cursor-pointer" />
                        <Trash2
                          size={16}
                          className="text-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
