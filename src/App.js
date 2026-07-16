
import React, { useState, useEffect, useRef } from "react";
import AssetForm from "./components/AssetForm";
import AssetList from "./components/AssetList";
import AssetDetail from "./components/AssetDetail";
import FilterBar from "./components/FilterBar";
import Toolbar from "./components/Toolbar";
import { clearAssets } from "./assetService";
import BulkImportForm from "./components/BulkImportForm";
import { getNextAssetNumber } from "./assetService";
import CompanyStats from "./components/CompanyStats";
import Modal from "./components/Modal";
import QRCodeModal from "./components/QRCodeModal";
import CreateAccountForm from "./components/CreateAccountForm";
import { syncPublicAssets } from "./assetService";
import "./styles.css";
import AccountManagementModal
  from "./components/AccountManagementModal";
import TrashModal from "./components/TrashModel";
import {
  validateAssetDuplicates,
} from "./assetService";
// import { confirm } from "./utils/alert";
// import { loadAssets, saveAssets } from "./utils/localStorage";
import { getAssets } from "./assetService";
import {
  moveAssetToTrash,
  getTrashAssets,
  restoreAsset,
  permanentlyDeleteAsset,
  clearTrash,
} from "./assetService";
import {
  showConfirm,
  showError,
  showToast,
  showSuccess,
} from "./utils/alert";
import {
  addAsset as addAssetFirebase,
  updateAsset as updateAssetFirebase,
  replaceAllAssets
  // importAssets
} from "./assetService";
import {
  exportAssetsToExcel,
  importAssetsFromExcel
} from "./utils/excel";
import "./styles.css";
import Login from "./components/Login";

import {
  watchAuthState,
  getUserProfile,
  logout,
} from "./authService";
function App() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [assets, setAssets] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [qrAsset, setQrAsset] = useState(null);
  const [trashAssets, setTrashAssets] = useState([]);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [userProfile, setUserProfile] =
    useState(null);
  const isAdmin = userProfile?.role === "admin";
  // const [codeSearch, setCodeSearch] = useState("");
  const menuRef = useRef(null);
  const [currentUser, setCurrentUser] =
    useState(null);



  const [authLoading, setAuthLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState("");
  const [
    showCreateAccountModal,
    setShowCreateAccountModal,
  ] = useState(false);
  const [
    showAccountManagement,
    setShowAccountManagement,
  ] = useState(false);
  // khôi phục 
  const handleRestoreAsset = async (asset) => {
    if (!isAdmin) return;

    try {
      await restoreAsset(asset);

      showToast(
        "success",
        `Đã khôi phục ${asset.code}`
      );
    } catch (error) {
      await showError(
        "Không thể khôi phục",
        error.message
      );
    }
  };
  //xóa sạch
  const handlePermanentDelete = async (
    asset
  ) => {
    if (!isAdmin) return;

    const result = await showConfirm({
      title: "Xóa vĩnh viễn",
      text: `Tài sản ${asset.code} sẽ bị xóa hoàn toàn và không thể khôi phục.`,
      confirmText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      icon: "warning",
      danger: true,
    });

    if (!result.isConfirmed) return;

    try {
      await permanentlyDeleteAsset(
        asset.firebaseId
      );

      showToast(
        "success",
        `Đã xóa vĩnh viễn ${asset.code}`
      );
    } catch (error) {
      await showError(
        "Không thể xóa vĩnh viễn",
        error.message
      );
    }
  };
  // clear thùng rác
  const handleClearTrash = async () => {
    if (!isAdmin) return;

    const result = await showConfirm({
      title: "Xóa toàn bộ thùng rác",
      text: `${trashAssets.length} tài sản sẽ bị xóa hoàn toàn và không thể khôi phục.`,
      confirmText: "Xóa toàn bộ",
      cancelText: "Hủy",
      icon: "warning",
      danger: true,
    });

    if (!result.isConfirmed) return;

    try {
      await clearTrash();

      showToast(
        "success",
        "Đã xóa toàn bộ thùng rác"
      );
    } catch (error) {
      await showError(
        "Không thể xóa thùng rác",
        error.message
      );
    }
  };
  // const addAsset = async (asset) => {
  //   if (!isAdmin) {
  //     await showError(
  //       "Không có quyền",
  //       "Bạn không có quyền thêm tài sản."
  //     );

  //     return;
  //   }

  //   try {
  //     await addAssetFirebase({
  //       ...asset,

  //       createdDate:
  //         asset.createdDate ||
  //         new Date().toISOString().split("T")[0],

  //       logs: [
  //         {
  //           action: "Khởi tạo tài sản",
  //           date: new Date().toLocaleString("vi-VN"),
  //           detail: `Tạo bởi ${userProfile?.name ||
  //             currentUser?.email ||
  //             "Admin"
  //             }`,
  //         },
  //       ],
  //     });

  //     showToast(
  //       "success",
  //       "Thêm tài sản thành công"
  //     );
  //   } catch (error) {
  //     console.error(
  //       "Lỗi thêm tài sản:",
  //       error
  //     );

  //     await showError(
  //       "Không thể thêm tài sản",
  //       error.message ||
  //       "Đã xảy ra lỗi khi lưu dữ liệu."
  //     );
  //   }
  // };
  const addAsset = async (asset) => {
    if (!isAdmin) {
      await showError(
        "Không có quyền",
        "Bạn không có quyền thêm tài sản."
      );
      return;
    }

    try {
      const duplicateResult =
        await validateAssetDuplicates(asset);

      if (!duplicateResult.valid) {
        await showError(
          "Dữ liệu đã tồn tại",
          duplicateResult.message
        );
        return;
      }

      await addAssetFirebase({
        ...asset,

        createdDate:
          asset.createdDate ||
          new Date()
            .toISOString()
            .split("T")[0],

        logs: [
          {
            action: "Khởi tạo tài sản",
            date: new Date().toLocaleString(
              "vi-VN"
            ),
            detail: `Tạo bởi ${userProfile?.name ||
              currentUser?.email ||
              "Admin"
              }`,
          },
        ],
      });

      showToast(
        "success",
        "Thêm tài sản thành công"
      );
    } catch (error) {
      console.error(
        "Lỗi thêm tài sản:",
        error
      );

      await showError(
        "Không thể thêm tài sản",
        error.message ||
        "Đã xảy ra lỗi khi lưu dữ liệu."
      );
    }
  };
  // useEffect(() => {
  //   saveAssets(assets);
  // }, [assets]);
  const handleLogout = async () => {
    const result = await showConfirm({
      title: "Đăng xuất",
      text: "Bạn có muốn đăng xuất khỏi hệ thống không?",
      confirmText: "Đăng xuất",
      cancelText: "Ở lại",
      icon: "question",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await logout();

      showToast(
        "success",
        "Đăng xuất thành công"
      );
    } catch (error) {
      console.error(
        "Lỗi đăng xuất:",
        error
      );

      await showError(
        "Không thể đăng xuất",
        error.message
      );
    }
  };
  useEffect(() => {
    if (!userProfile) return;

    const unsubscribe = getAssets(
      userProfile,
      setAssets
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [userProfile]);
  // theo dõi thùng rác
  useEffect(() => {
    if (!isAdmin) {
      setTrashAssets([]);
      return;
    }

    const unsubscribe = getTrashAssets(setTrashAssets);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isAdmin]);
  // const clearData = () => {
  //   localStorage.removeItem("assets");
  //   setAssets([]);
  // };
  // const clearData = async () => {
  //   if (!isAdmin) {
  //     await showError(
  //       "Không có quyền",
  //       "Chỉ Admin được xóa toàn bộ dữ liệu."
  //     );

  //     return;
  //   }

  //   const result = await showConfirm({
  //     title: "Xóa toàn bộ dữ liệu",
  //     text: "Tất cả tài sản sẽ bị xóa và không thể khôi phục.",
  //     confirmText: "Xóa toàn bộ",
  //     cancelText: "Hủy",
  //     icon: "warning",
  //     danger: true,
  //   });

  //   if (!result.isConfirmed) {
  //     return;
  //   }

  //   try {
  //     await clearAssets();

  //     showToast(
  //       "success",
  //       "Đã xóa toàn bộ dữ liệu"
  //     );
  //   } catch (error) {
  //     console.error(
  //       "Lỗi xóa dữ liệu:",
  //       error
  //     );

  //     await showError(
  //       "Không thể xóa dữ liệu",
  //       error.message
  //     );
  //   }
  // };
  const clearData = async () => {
    if (!isAdmin) {
      await showError(
        "Không có quyền",
        "Chỉ Admin được xóa toàn bộ dữ liệu."
      );
      return;
    }

    const result = await showConfirm({
      title: "Xóa toàn bộ dữ liệu",
      text: "Tất cả tài sản và dữ liệu QR sẽ bị xóa.",
      confirmText: "Xóa toàn bộ",
      cancelText: "Hủy",
      icon: "warning",
      danger: true,
    });

    if (!result.isConfirmed) return;

    try {
      await clearAssets();

      showToast(
        "success",
        "Đã xóa toàn bộ dữ liệu"
      );
    } catch (error) {
      console.error("Lỗi xóa dữ liệu:", error);

      await showError(
        "Không thể xóa dữ liệu",
        error.message ||
        "Firebase đã từ chối thao tác."
      );
    }
  };
  useEffect(() => {

    function handleClickOutside(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);
  useEffect(() => {
    const unsubscribe = watchAuthState(
      async (user) => {
        try {
          setAuthLoading(true);
          setAuthError("");

          if (!user) {
            setCurrentUser(null);
            setUserProfile(null);
            return;
          }

          const profile = await getUserProfile(
            user.uid
          );

          if (!profile) {
            setAuthError(
              "Tài khoản chưa được Admin phân quyền."
            );

            await logout();

            setCurrentUser(null);
            setUserProfile(null);
            return;
          }

          if (profile.enabled === false) {
            setAuthError(
              "Tài khoản này đã bị khóa."
            );

            await logout();

            setCurrentUser(null);
            setUserProfile(null);
            return;
          }

          setCurrentUser(user);
          setUserProfile(profile);
        } catch (error) {
          console.error(
            "Lỗi tải tài khoản:",
            error
          );

          setAuthError(
            "Không thể tải thông tin tài khoản."
          );

          setCurrentUser(null);
          setUserProfile(null);
        } finally {
          setAuthLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // const updateAsset = (updatedAsset) => {
  //   setAssets(
  //     assets.map((asset) => {
  //       if (asset.id !== updatedAsset.id) return asset;

  //       const logs = [...(Array.isArray(asset.logs) ? asset.logs : [])];
  //       if (asset.user !== updatedAsset.user) {
  //         logs.push({
  //           action: `Cấp phát cho ${updatedAsset.user}`,
  //           date: new Date().toLocaleString(),
  //         });
  //       }

  //       if (
  //         asset.status === "Đang cấp phát" &&
  //         updatedAsset.status === "Kho"
  //       ) {
  //         logs.push({
  //           action: "Thu hồi tài sản",
  //           date: new Date().toLocaleString(),
  //         });
  //       }

  //       return {
  //         ...updatedAsset,
  //         logs,
  //       };
  //     })
  //   );
  //   const updateAsset = async (updatedAsset) => {

  //     const asset = assets.find(a => a.firebaseId === updatedAsset.firebaseId);

  //     const logs = [...(asset?.logs || [])];

  //     if (asset.user !== updatedAsset.user) {
  //       logs.push({
  //         action: `Cấp phát cho ${updatedAsset.user}`,
  //         date: new Date().toLocaleString(),
  //       });
  //     }

  //     if (
  //       asset.status === "Đang cấp phát" &&
  //       updatedAsset.status === "Kho"
  //     ) {
  //       logs.push({
  //         action: "Thu hồi tài sản",
  //         date: new Date().toLocaleString(),
  //       });
  //     }

  //     await updateAssetFirebase({
  //       ...updatedAsset,
  //       logs,
  //     });

  //     setEditingAsset(null);


  //   setEditingAsset(null);
  //   };
  // };
  // const updateAsset = async (updatedAsset) => {
  //   const asset = assets.find(
  //     a => a.firebaseId === updatedAsset.firebaseId
  //   );

  //   if (!asset) return;

  //   const logs = [...(asset.logs || [])];

  //   if (asset.user !== updatedAsset.user) {
  //     logs.push({
  //       action: "Thay đổi người sử dụng",
  //       date: new Date().toLocaleString(),
  //       detail: `${asset.user || "Kho"} → ${updatedAsset.user || "Kho"}`,
  //     });
  //   }

  //   if (asset.status !== updatedAsset.status) {
  //     logs.push({
  //       action: "Thay đổi trạng thái",
  //       date: new Date().toLocaleString(),
  //       detail: `${asset.status} → ${updatedAsset.status}`,
  //     });
  //   }

  //   if (asset.note !== updatedAsset.note) {
  //     logs.push({
  //       action: "Cập nhật ghi chú",
  //       date: new Date().toLocaleString(),
  //       detail: `${asset.note || "Trống"} → ${updatedAsset.note || "Trống"}`,
  //     });
  //   }

  //   await updateAssetFirebase({
  //     ...updatedAsset,
  //     logs,
  //   });

  //   setEditingAsset(null);
  // };
  const updateAsset = async (updatedAsset) => {
    if (!isAdmin) {
      alert("Bạn không có quyền sửa tài sản.");
      return;
    }
    const oldAsset = assets.find(
      (asset) => asset.firebaseId === updatedAsset.firebaseId
    );

    if (!oldAsset) return;
    const duplicateResult =
      await validateAssetDuplicates(
        updatedAsset,
        updatedAsset.firebaseId
      );

    if (!duplicateResult.valid) {
      await showError(
        "Dữ liệu đã tồn tại",
        duplicateResult.message
      );
      return;
    }

    const logs = Array.isArray(oldAsset.logs)
      ? [...oldAsset.logs]
      : [];

    const now = new Date().toLocaleString("vi-VN");

    // Thay đổi mã tài sản
    if (oldAsset.code !== updatedAsset.code) {
      logs.push({
        action: "Thay đổi mã tài sản",
        date: now,
        detail: `${oldAsset.code || "Trống"} → ${updatedAsset.code || "Trống"}`,
      });
    }

    // Thay đổi tên
    if (oldAsset.name !== updatedAsset.name) {
      logs.push({
        action: "Thay đổi tên tài sản",
        date: now,
        detail: `${oldAsset.name || "Trống"} → ${updatedAsset.name || "Trống"}`,
      });
    }

    // Thay đổi công ty
    if (oldAsset.company !== updatedAsset.company) {
      logs.push({
        action: "Thay đổi công ty",
        date: now,
        detail: `${oldAsset.company || "Trống"} → ${updatedAsset.company || "Trống"}`,
      });
    }

    // Thay đổi người sử dụng
    if (oldAsset.user !== updatedAsset.user) {
      logs.push({
        action: "Thay đổi người sử dụng",
        date: now,
        detail: `${oldAsset.user || "Chưa cấp phát"} → ${updatedAsset.user || "Chưa cấp phát"
          }`,
      });
    }

    // Thay đổi giá tiền
    if (Number(oldAsset.price) !== Number(updatedAsset.price)) {
      logs.push({
        action: "Thay đổi giá tiền",
        date: now,
        detail: `${Number(oldAsset.price || 0).toLocaleString("vi-VN")} ₫ → ${Number(
          updatedAsset.price || 0
        ).toLocaleString("vi-VN")} ₫`,
      });
    }

    // Thay đổi ghi chú
    if (oldAsset.note !== updatedAsset.note) {
      logs.push({
        action: "Thay đổi ghi chú",
        date: now,
        detail: `${oldAsset.note || "Trống"} → ${updatedAsset.note || "Trống"}`,
      });
    }

    // Thay đổi trạng thái
    if (oldAsset.status !== updatedAsset.status) {
      logs.push({
        action: "Thay đổi trạng thái",
        date: now,
        detail: `${oldAsset.status || "Trống"} → ${updatedAsset.status || "Trống"
          }`,
      });
    }
    if (
      (oldAsset.ipAddress || "") !==
      (updatedAsset.ipAddress || "")
    ) {
      logs.push({
        action: "Thay đổi địa chỉ IP",
        date: now,
        detail: `${oldAsset.ipAddress || "Chưa có"} → ${updatedAsset.ipAddress || "Chưa có"
          }`,
      });
    }

    try {
      await updateAssetFirebase({
        ...updatedAsset,
        logs,
      });

      setEditingAsset(null);

      showToast(
        "success",
        "Cập nhật tài sản thành công"
      );
    } catch (error) {
      console.error(
        "Lỗi cập nhật:",
        error
      );

      await showError(
        "Không thể cập nhật tài sản",
        error.message
      );
    }
  };

  // const deleteAsset = (id) => {
  //   if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
  //     setAssets(assets.filter((a) => a.id !== id));
  //     setSelectedAsset(null);
  //   }
  // };
  const deleteAsset = async (firebaseId) => {
    if (!isAdmin) {
      await showError(
        "Không có quyền",
        "Chỉ Admin được xóa tài sản."
      );
      return;
    }

    const asset = assets.find(
      (item) => item.firebaseId === firebaseId
    );

    if (!asset) {
      await showError(
        "Không tìm thấy tài sản",
        "Tài sản có thể đã bị xóa."
      );
      return;
    }

    const result = await showConfirm({
      title: "Chuyển vào thùng rác",
      text: `Tài sản ${asset.code} sẽ được chuyển vào thùng rác và có thể khôi phục.`,
      confirmText: "Chuyển vào thùng rác",
      cancelText: "Hủy",
      icon: "warning",
      danger: true,
    });

    if (!result.isConfirmed) return;

    try {
      await moveAssetToTrash({
        asset,
        deletedBy:
          userProfile?.name ||
          currentUser?.email ||
          "Admin",
      });

      setSelectedAsset(null);

      showToast(
        "success",
        "Đã chuyển tài sản vào thùng rác"
      );
    } catch (error) {
      console.error("Lỗi xóa mềm:", error);

      await showError(
        "Không thể xóa tài sản",
        error.message
      );
    }
  };


  // const filteredAssets = assets.filter((asset) => {
  //   const matchName = asset.name
  //     .toLowerCase()
  //     .includes(searchText.toLowerCase());

  //   const matchCompany =
  //     companyFilter === "" || asset.company === companyFilter;

  //   return matchName && matchCompany;
  // });

  const bulkImportAssets = async (data) => {

    const quantity = Number(data.quantity);

    let nextNumber = await getNextAssetNumber(data.code);

    for (let i = 0; i < quantity; i++) {

      await addAssetFirebase({

        code:
          data.code +
          String(nextNumber).padStart(3, "0"),

        name: data.name,

        company: data.company,

        user: "",

        price: Number(data.price),

        note: data.note,

        status: "Kho",

        logs: [

          {

            action: "Khởi tạo tài sản",

            date: new Date().toLocaleString(),
            detail: `Nhập kho từ mã gốc ${data.code}`,

          }

        ]

      });

      nextNumber++;

    }

    await showSuccess(
      "Nhập kho thành công",
      `Đã tạo ${quantity} tài sản mới.`
    );

  };
  // const filteredAssets = assets.filter((asset) => {

  //   const matchCode = asset.code
  //     .toLowerCase()
  //     .includes(codeSearch.toLowerCase());

  //   const matchName = asset.name
  //     .toLowerCase()
  //     .includes(searchText.toLowerCase());

  //   const matchCompany =
  //     companyFilter === "" ||
  //     asset.company === companyFilter;

  //   return matchCode && matchName && matchCompany;

  // });
  const filteredAssets = assets.filter((asset) => {
    const keyword = searchText.toLowerCase().trim();

    const matchSearch =
      (asset.code || "").toLowerCase().includes(keyword) ||
      (asset.name || "").toLowerCase().includes(keyword) ||
      (asset.user || "").toLowerCase().includes(keyword) ||
      (asset.note || "").toLowerCase().includes(keyword);

    const matchCompany =
      companyFilter === "" || asset.company === companyFilter;

    const matchStatus =
      statusFilter === "" || asset.status === statusFilter;

    return matchSearch && matchCompany && matchStatus;
  });
  if (authLoading) {
    return (
      <div className="page-loading">
        Đang tải hệ thống...
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return (
      <>
        {authError && (
          <div className="auth-global-error">
            {authError}
          </div>
        )}

        <Login />
      </>
    );
  }
  // const isAdmin =
  //   userProfile?.role === "admin";
  // const canCreate = isAdmin;
  // const canEdit = isAdmin;
  // const canDelete = isAdmin;
  // const canImport = isAdmin;
  // const canExport = isAdmin;
  // const canClearAll = isAdmin;
  // const canManageAccounts = isAdmin;
  const validateImportedAssets = async (
    importedAssets
  ) => {
    for (let index = 0; index <
      importedAssets.length;
      index++
    ) {
      const asset =
        importedAssets[index];

      const result =
        await validateAssetDuplicates(
          asset
        );

      if (!result.valid) {
        return {
          valid: false,
          row: index + 2,
          message: result.message,
        };
      }
    }

    return {
      valid: true,
    };
  };
  return (

    <div className="container">
      <div className="app-header">
        <div className="title">QUẢN LÝ TÀI SẢN HEXAGROUP</div>
      </div>
      {isAdmin && (
        <button
          className="menu-action-btn account-menu-btn create-account-top-btn"
          onClick={() => {
            setShowMenu(false);
            setShowCreateAccountModal(true);
          }}
        >
          <span className="menu-action-icon">♙</span>

          <span className="menu-action-text">
            Tạo tài khoản
          </span>
        </button>

      )}
      {isAdmin &&
        showCreateAccountModal && (
          <Modal
            title="Tạo tài khoản nhân viên"
            onClose={() =>
              setShowCreateAccountModal(false)
            }
          >
            <CreateAccountForm
              onSuccess={() =>
                setShowCreateAccountModal(false)
              }
            />
          </Modal>
        )}
      {/* 
      <div className="action-bar">
        <button onClick={() => setShowAddModal(true)}>
          ➕ Thêm tài sản
        </button>

        <button onClick={() => setShowBulkModal(true)}>
          📥 Nhập kho hàng loạt
        </button>
      </div>
      {/* <AssetForm
        onSubmit={editingAsset ? updateAsset : addAsset}
        editingAsset={editingAsset}
      /> 

      <FilterBar
        searchText={searchText}
        setSearchText={setSearchText}
        codeSearch={codeSearch}
        setCodeSearch={setCodeSearch}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
      />
      <Toolbar
        onExport={() => exportAssetsToExcel(assets)}
        // onImport={(file) =>
        //   importAssetsFromExcel(file, (newAssets) => {
        //     setAssets((prev) => [...prev, ...newAssets]);
        //   })
        // }
        onImport={(file) =>
          importAssetsFromExcel(file, async (newAssets) => {
            await replaceAllAssets(newAssets);
          })
        }
      />
      <button className="buttonXoa delete-btn" onClick={clearData}>Xóa dữ liệu</button>
     <BulkImportForm
        onSubmit={bulkImportAssets}
      /> */}
      <div className="top-toolbar compact-toolbar">
        <div className="search-box">
          <FilterBar
            searchText={searchText}
            setSearchText={setSearchText}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        <div className="menu-wrapper" ref={menuRef}>
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Đăng xuất
          </button>

          {
            isAdmin &&
            <button
              className="special-btn sync-data-btn"
              onClick={async () => {
                try {
                  await syncPublicAssets();
                  showToast("success", "Đã đồng bộ dữ liệu QR");
                } catch (error) {
                  await showError(
                    "Đồng bộ thất bại",
                    error.message
                  );
                }
              }}
            >
              <span className="special-btn-icon">⟳</span>

              <span className="special-btn-content">
                <strong>Đồng bộ QR</strong>
                <small>Cập nhật dữ liệu quét mã</small>
              </span>
            </button>

          }
          {/* <button
            onClick={async () => {
              try {
                await syncPublicAssets();
                showToast("success", "Đã đồng bộ dữ liệu QR");
              } catch (error) {
                await showError(
                  "Đồng bộ thất bại",
                  error.message
                );
              }
            }}
          >
            Đồng bộ dữ liệu QR
          </button> */}
          {isAdmin &&
            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ☰ Menu
            </button>}
          {/* <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰ Menu
          </button> */}

          <div className={`dropdown-menu ${showMenu ? "show" : ""}`}>
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              ➕ Thêm tài sản
            </button>

            <button className="success-btn" onClick={() => setShowBulkModal(true)}>
              📥 Nhập kho hàng loạt
            </button>
            <button
              className="menu-action-btn account-manage-btn"
              onClick={() => {
                setShowMenu(false);
                setShowAccountManagement(true);
              }}
            >
              <span className="menu-action-icon">
                👥
              </span>

              <span className="menu-action-text">
                Quản lý tài khoản
              </span>
            </button>

            <Toolbar
              onExport={() => exportAssetsToExcel(assets)}
              onImport={(file) =>
                importAssetsFromExcel(
                  file,
                  async (newAssets) => {
                    try {
                      const validation =
                        await validateImportedAssets(
                          newAssets
                        );

                      if (!validation.valid) {
                        await showError(
                          `Lỗi tại dòng ${validation.row}`,
                          validation.message
                        );
                        return;
                      }

                      await replaceAllAssets(
                        newAssets
                      );

                      await showSuccess(
                        "Import thành công",
                        `Đã nhập ${newAssets.length} tài sản.`
                      );
                    } catch (error) {
                      await showError(
                        "Import thất bại",
                        error.message
                      );
                    }
                  }
                )
              }
            />

            <button className="danger-btn" onClick={clearData}>
              🗑 Xóa dữ liệu
            </button>
            <button
              className="menu-action-btn trash-menu-btn"
              onClick={() => {
                setShowMenu(false);
                setShowTrashModal(true);
              }}
            >
              <span className="menu-action-icon">🗑️</span>

              <span className="menu-action-text">
                Thùng rác
              </span>

              {trashAssets.length > 0 && (
                <span className="trash-menu-count">
                  {trashAssets.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <CompanyStats assets={assets} />
      <div className="table-container">

        <AssetList
          assets={filteredAssets}
          onEdit={(asset) => {
            if (!isAdmin) return;

            setEditingAsset(asset);
            setShowAddModal(true);
          }}
          onDelete={deleteAsset}
          onSelect={setSelectedAsset}
          onShowQR={setQrAsset}
          canEdit={isAdmin}
          canDelete={isAdmin}
        />
      </div>
      <div className="table-footer">
        <span>
          <strong>{filteredAssets.length}</strong> /{" "}
          <strong>{assets.length}</strong>
        </span>
      </div>

      {selectedAsset && (
        <Modal
          title="Chi tiết tài sản"
          onClose={() => setSelectedAsset(null)}
        >
          <AssetDetail asset={selectedAsset} />
        </Modal>
      )}
      {showAddModal && (
        <Modal
          title={editingAsset ? "Cập nhật tài sản" : "Thêm tài sản"}
          onClose={() => {
            setShowAddModal(false);
            setEditingAsset(null);
          }}
        >
          <AssetForm
            onSubmit={async (asset) => {
              if (editingAsset) {
                await updateAsset(asset);
              } else {
                await addAsset(asset);
              }

              setShowAddModal(false);
              setEditingAsset(null);
            }}
            editingAsset={editingAsset}
          />
        </Modal>
      )}

      {showBulkModal && (
        <Modal
          title="Nhập kho hàng loạt"
          onClose={() => setShowBulkModal(false)}
        >
          <BulkImportForm
            onSubmit={async (data) => {
              await bulkImportAssets(data);
              setShowBulkModal(false);
            }}
          />
        </Modal>
      )}
      {qrAsset && (
        <QRCodeModal
          asset={qrAsset}
          onClose={() => setQrAsset(null)}
        />
      )}
      {isAdmin && showTrashModal && (
        <TrashModal
          assets={trashAssets}
          onRestore={handleRestoreAsset}
          onPermanentDelete={
            handlePermanentDelete
          }
          onClearTrash={handleClearTrash}
          onClose={() =>
            setShowTrashModal(false)
          }
        />
      )}
      {isAdmin && showAccountManagement && (
        <AccountManagementModal
          currentUserUid={currentUser?.uid}
          onClose={() =>
            setShowAccountManagement(false)
          }
        />
      )}
    </div>
  );
};

export default App;