import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  FileText,
  Briefcase,
  Tag,
  Calendar,
  Activity,
  Edit,
  Users,
  ArrowLeft,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import {
  DetailViewContainer,
  ProfileHeader,
  Tabs,
  KeyValueCard,
  Timeline,
  DataTable,
} from "../components/ui";
import { canWrite } from "../utils/rbac";
import { AuthContext } from "../context/AuthContext";
import { AriaContext } from "../context/AriaContext";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
const VendorDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const { user } = React.useContext(AuthContext);
  const { openAria } = React.useContext(AriaContext);
  const writeAccess = canWrite(user);
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const { data: vendorData } = await API.get(`/vendors/${id}`);
        const actualVendor = vendorData.vendor || vendorData;
        setVendor(actualVendor);
        const { data: materialsData } = await API.get("/materials");
        const vId = String(actualVendor.id || actualVendor._id);
        const vMaterials = materialsData.filter(
          (m) =>
            String(m.vendorId) === vId ||
            String(m.vendor?.id || m.vendor?._id || m.vendor) === vId
        );
        setMaterials(vMaterials);
        const events = [];
        if (actualVendor.createdAt) {
          events.push({
            id: "created",
            time: new Date(actualVendor.createdAt).toLocaleDateString(),
            action: "Vendor Profile Created",
            description: `Vendor profile for ${actualVendor.name} was successfully created.`,
            color: "#10B981",
          });
        }
        if (
          actualVendor.updatedAt &&
          actualVendor.updatedAt !== actualVendor.createdAt
        ) {
          events.push({
            id: "updated",
            time: new Date(actualVendor.updatedAt).toLocaleDateString(),
            action: "Profile Updated",
            description: `Vendor details were recently updated.`,
            color: "#3b82f6",
          });
        }
        try {
          const { data: orders } = await API.get(`/orders`);
          const vendorOrders = (orders || []).filter(
            (o) =>
              String(o.vendorId) === vId ||
              String(o.vendor?.id || o.vendor?._id) === vId
          );
          vendorOrders.forEach((order) => {
            events.push({
              id: `order-${order._id || order.id}`,
              time: new Date(
                order.createdAt || order.date || new Date()
              ).toLocaleDateString(),
              action: `Purchase Order Placed`,
              description: `Order ${
                order.orderNumber || "Unknown"
              } was raised for ₹${(
                order.totalAmount ||
                order.grandTotal ||
                0
              ).toLocaleString()}`,
              color: "#8b5cf6",
            });
          });
        } catch (e) {
          console.log("Could not fetch orders for timeline");
        }
        setTimeline(events.reverse());
      } catch (err) {
        console.error("VendorDetails load error:", err);
        toast.error(
          "Failed to load vendor details: " +
            (err.response?.data?.message || err.message)
        );
        navigate("/vendors");
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id, navigate]);
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>Loading...</div>
    );
  if (!vendor) return null;
  const badges = [
    {
      label: vendor.status || "Active Partner",
      type:
        (vendor.status || "").toLowerCase() === "active"
          ? "success"
          : "warning",
    },
    { label: vendor.category || "Vendor", type: "info" },
  ];
  const actions = [
    {
      label: "Ask Aria",
      icon: Sparkles,
      onClick: () =>
        openAria({
          type: "Vendor",
          id: vendor._id || vendor.id,
          name: vendor.name,
        }),
      style: {
        background: "#f5f3ff",
        color: "#8b5cf6",
        borderColor: "#ede9fe",
      },
    },
  ];
  if (writeAccess) {
    actions.push({
      label: "Raise PO",
      icon: ShoppingCart,
      primary: true,
      onClick: () =>
        navigate(`/orders/create/purchase?vendorId=${vendor._id || vendor.id}`),
    });
  }
  const overviewContent = (
    <div className="ui-grid-2">
      <KeyValueCard
        title="Contact Information"
        items={[
          { label: "Email Address", value: vendor.email },
          { label: "Phone Number", value: vendor.phone || "N/A" },
          { label: "Website", value: vendor.website || "N/A" },
          { label: "Primary Contact", value: vendor.contactPerson || "N/A" },
        ]}
      />
      <KeyValueCard
        title="Business Details"
        items={[
          { label: "Company Name", value: vendor.name },
          { label: "GST Number", value: vendor.gstNumber || "N/A" },
          { label: "Category", value: vendor.category || "Uncategorized" },
          { label: "Address", value: vendor.address || "N/A" },
        ]}
      />
    </div>
  );
  const materialsColumns = [
    { key: "sku", label: "Item Code", sortable: true },
    { key: "name", label: "Material Name", sortable: true },
    {
      key: "quantity",
      label: "Current Stock",
      sortable: true,
      render: (val, row) => `${val} ${row.unit || "pcs"}`,
    },
    {
      key: "price",
      label: "Unit Price",
      sortable: true,
      render: (val) => `₹${val}`,
    },
  ];
  const materialsContent = (
    <DataTable
      title="Supplied Materials"
      subtitle={`Materials currently sourced from ${vendor.name}`}
      columns={materialsColumns}
      data={materials}
      actions={[
        {
          label: "View Material",
          icon: Package,
          onClick: (row) => navigate(`/materials/${row._id || row.id}`),
        },
      ]}
      primaryAction={
        writeAccess
          ? {
              label: "Add Material",
              icon: Plus,
              onClick: () =>
                navigate(`/materials/new?vendorId=${vendor._id || vendor.id}`),
            }
          : undefined
      }
      searchPlaceholder="Search materials..."
      variant="flat"
    />
  );
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Building2,
      content: overviewContent,
    },
    {
      id: "materials",
      label: "Materials",
      icon: Package,
      content: materialsContent,
    },
    {
      id: "history",
      label: "History",
      icon: FileText,
      content: (
        <Timeline
          items={timeline.map((t, i) => ({
            id: t.id || i,
            time: t.date ? new Date(t.date).toLocaleDateString() : t.time,
            title: t.action || "Event",
            description: t.description || "System action",
            color: "#3b82f6",
          }))}
        />
      ),
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "24px" }}
    >
      <div style={{ marginBottom: "16px" }}>
        <PageHeader title="" showBack={true} backPath="/vendors" />
      </div>
      <DetailViewContainer>
        <ProfileHeader
          title={vendor.name || "Unnamed Vendor"}
          subtitle={`Vendor ID: ${vendor._id || vendor.id}`}
          avatarText={(vendor.name || "V").substring(0, 2).toUpperCase()}
          badges={badges}
          actions={actions}
        />
        <Tabs tabs={tabs} />
      </DetailViewContainer>
    </motion.div>
  );
};
export default VendorDetails;
