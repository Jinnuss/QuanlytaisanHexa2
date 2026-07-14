
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
import "./styles.css";
// import { loadAssets, saveAssets } from "./utils/localStorage";
import { getAssets } from "./assetService";
import {
  addAsset as addAssetFirebase,
  updateAsset as updateAssetFirebase,
  deleteAsset as deleteAssetFirebase,
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
  // const isAdmin = userProfile?.role === "admin";
  // const [codeSearch, setCodeSearch] = useState("");
  const menuRef = useRef(null);
  const [currentUser, setCurrentUser] =
    useState(null);

  const [userProfile, setUserProfile] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState("");
  const [
    showCreateAccountModal,
    setShowCreateAccountModal,
  ] = useState(false);
  const addAsset = async (asset) => {
    if (!isAdmin) {
      alert("Bạn không có quyền thêm tài sản.");
      return;
    }

    await addAssetFirebase({
      ...asset,
      logs: [
        {
          action: "Khởi tạo tài sản",
          date: new Date().toLocaleString(
            "vi-VN"
          ),
          detail: `Tạo bởi ${userProfile.name ||
            currentUser.email
            }`,
        },
      ],
    });
  };
  // useEffect(() => {
  //   saveAssets(assets);
  // }, [assets]);
  const handleLogout = async () => {
    const ok = window.confirm("Bạn có muốn đăng xuất?");

    if (!ok) return;

    try {
      await logout();
    } catch (err) {
      console.error(err);
      alert("Không thể đăng xuất.");
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
  // const clearData = () => {
  //   localStorage.removeItem("assets");
  //   setAssets([]);
  // };
  const clearData = async () => {
    if (!isAdmin) {
      alert(
        "Bạn không có quyền xóa toàn bộ dữ liệu."
      );
      return;
    }

    if (!window.confirm("Xóa toàn bộ dữ liệu?")) return;

    await clearAssets();

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

    await updateAssetFirebase({
      ...updatedAsset,
      logs,
    });

    setEditingAsset(null);
  };

  // const deleteAsset = (id) => {
  //   if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
  //     setAssets(assets.filter((a) => a.id !== id));
  //     setSelectedAsset(null);
  //   }
  // };
  const deleteAsset = async (firebaseId) => {
    if (!isAdmin) {
      alert("Bạn không có quyền xóa tài sản.");
      return;
    }

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa?"
      )
    ) {
      return;
    }

    await deleteAssetFirebase(firebaseId);
    setSelectedAsset(null);
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

    alert("Nhập kho thành công!");

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
  const isAdmin =
    userProfile?.role === "admin";
  // const canCreate = isAdmin;
  // const canEdit = isAdmin;
  // const canDelete = isAdmin;
  // const canImport = isAdmin;
  // const canExport = isAdmin;
  // const canClearAll = isAdmin;
  // const canManageAccounts = isAdmin;
  return (

    <div className="container">
      <div className="app-header">
        <div className="title">QUẢN LÝ TÀI SẢN HEXAGROUP</div>
      </div>
      {isAdmin && (
        <button
          onClick={() => {
            setShowMenu(false);
            setShowCreateAccountModal(true);
          }}
        >
          👤 Tạo tài khoản
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
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰ Menu
          </button>

          <div className={`dropdown-menu ${showMenu ? "show" : ""}`}>
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              ➕ Thêm tài sản
            </button>

            <button className="success-btn" onClick={() => setShowBulkModal(true)}>
              📥 Nhập kho hàng loạt
            </button>

            <Toolbar
              onExport={() => exportAssetsToExcel(assets)}
              onImport={(file) =>
                importAssetsFromExcel(file, async (newAssets) => {
                  await replaceAllAssets(newAssets);
                })
              }
            />

            <button className="danger-btn" onClick={clearData}>
              🗑 Xóa dữ liệu
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
    </div>
  );
};

export default App;