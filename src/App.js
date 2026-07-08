import React, { useState } from "react";
import { useEffect } from "react";
import AssetForm from "./components/AssetForm";
import AssetList from "./components/AssetList";
import AssetDetail from "./components/AssetDetail";
import FilterBar from "./components/FilterBar";
import Toolbar from "./components/Toolbar";
import { clearAssets } from "./assetService";
// import { loadAssets, saveAssets } from "./utils/localStorage";
import { getAssets } from "./assetService";
import {
  addAsset as addAssetFirebase,
  updateAsset as updateAssetFirebase,
  deleteAsset as deleteAssetFirebase,
  replaceAllAssets,
  importAssets
} from "./assetService";
import {
  exportAssetsToExcel,
  importAssetsFromExcel
} from "./utils/excel";
import "./styles.css";

function App() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [assets, setAssets] = useState([]);
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


  const filteredAssets = assets.filter((asset) => {
    const matchName = asset.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchCompany =
      companyFilter === "" || asset.company === companyFilter;

    return matchName && matchCompany;
  });

  return (
    <div className="container">
      <h1>Quản lý Trang Thiết Bị</h1>

      <AssetForm
        onSubmit={editingAsset ? updateAsset : addAsset}
        editingAsset={editingAsset}
      />

      <FilterBar
        searchText={searchText}
        setSearchText={setSearchText}
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
      <button onClick={clearData}>Xóa dữ liệu</button>

      <AssetList
        assets={filteredAssets}
        onEdit={setEditingAsset}
        onDelete={deleteAsset}
        onSelect={setSelectedAsset}
      />

      {selectedAsset && (
        <AssetDetail asset={selectedAsset} />
      )}
    </div>
  );
};

export default App;