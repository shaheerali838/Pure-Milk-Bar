import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Users, Truck, Droplets } from "lucide-react";
import CustomerHeader from "../components/Customer_&_Accounts/CustomerHeader";

export default function CustomerDeliveryHub() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenAddCustomer = () => {
    navigate("/customer-hub/customers?action=add");
  };

  const isDaily = location.pathname.includes("/daily-deliveries");
  const isDoorstep =
    location.pathname.includes("/doorstep-deliveries") ||
    location.pathname.includes("/doorstep-orders");

  let title = "Customers & Accounts Management";
  let subtitle;
  let badge = "Active Directory";
  let showAddButton = true;
  let icon = Users;
  let iconBg = "bg-purple-600";

  if (isDaily) {
    title = "Daily Monthly Deliveries";
    subtitle = "Scheduled Milk Subscriptions & Registers";
    badge = "Active Deliveries";
    showAddButton = false;
    icon = Droplets;
    iconBg = "bg-blue-600";
  } else if (isDoorstep) {
    title = "Doorstep Deliveries & Logistics";
    subtitle = "Route Management & Fleet Operations";
    badge = "Active Logistics";
    showAddButton = false;
    icon = Truck;
    iconBg = "bg-indigo-600";
  }

  return (
    <div className="customer-delivery-compact relative min-h-screen bg-slate-50/50 pb-10 space-y-3">
      {/* 1. Page Header with Navigation Pills directly below it */}
      <CustomerHeader
        title={title}
        subtitle={subtitle}
        badge={badge}
        icon={icon}
        iconBg={iconBg}
        showAddButton={showAddButton}
        onOpenAddModal={handleOpenAddCustomer}
        showNav={true}
      />

      {/* 2. Sub-page Content */}
      <Outlet />
    </div>
  );
}

