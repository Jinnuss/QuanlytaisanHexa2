
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
  // const [codeSearch, setCodeSearch] = useState("");
  const menuRef = useRef(null);
  const addAsset = async (asset) => {

    await addAssetFirebase({
      ...asset,
      logs: [
        {
          action: "Khởi tạo tài sản",
          date: new Date().toLocaleString(),
        },
      ],
    });

  };
  // useEffect(() => {
  //   saveAssets(assets);
  // }, [assets]);
  useEffect(() => {
    getAssets(setAssets);
  }, []);
  // const clearData = () => {
  //   localStorage.removeItem("assets");
  //   setAssets([]);
  // };
  const clearData = async () => {

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
  const updateAsset = async (updatedAsset) => {

    const asset = assets.find(
      a => a.firebaseId === updatedAsset.firebaseId
    );

    if (!asset) return;

    const logs = [...(asset.logs || [])];

    if (asset.user !== updatedAsset.user) {
      logs.push({
        action: `Cấp phát cho ${updatedAsset.user}`,
        date: new Date().toLocaleString(),
      });
    }

    if (
      asset.status === "Đang cấp phát" &&
      updatedAsset.status === "Kho"
    ) {
      logs.push({
        action: "Thu hồi tài sản",
        date: new Date().toLocaleString(),
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

    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;

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

            date: new Date().toLocaleString()

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

  return (
    <div className="container">
      <div className="title">Quản lý Tài Sản HEXAGROUP</div>
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
            setEditingAsset(asset);
            setShowAddModal(true);
          }}
          onDelete={deleteAsset}
          onSelect={setSelectedAsset}
        />
      </div>
      <div className="table-footer">
        <span>
           🟢<strong>{filteredAssets.length}</strong> /{" "}
          <strong>{assets.length}</strong> 📦
        </span>
      </div>

      {selectedAsset && (
        <AssetDetail asset={selectedAsset} />
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
    </div>
  );
};

export default App;