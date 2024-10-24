/* eslint-disable jsx-a11y/anchor-is-valid */
import GridList from "@material-ui/core/GridList";
import { GridListTile, GridListTileBar } from "@material-ui/core";
import ProductPlaceholder from "../../images/product_placeholder.jpg";
import { ProductModel } from "../../types";
import React from "react";

interface CategoryProps {
  products: ProductModel[];
}

export const CategorySlider: React.FC<CategoryProps> = ({ products }) => {
  const catCards = () => {
    if (Array.isArray(products)) {
      return products.map((item) => (
        <GridListTile
          key={item._id}
          style={{
            display: "flex",
            height: "120px",
            width: "160px",
            justifyContent: "center",
          }}
        >
          <a
            href="#"
            style={{
              textDecoration: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <img
                draggable={false}
                src={item.image_url}
                alt={"placeholder"}
                style={{
                  height: "82px",
                  width: "82px",
                  background: "red",
                  borderRadius: "41px",
                }}
              />
              <div
                style={{
                  width: "100%",
                  height: 60,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: "600",
                    margin: 0,
                    padding: 0,
                    color: "#505050",
                  }}
                >
                  {item.name}
                </span>
              </div>
            </div>
          </a>
        </GridListTile>
      ));
    }
    return <></>;
  };

  return (
    <div
      style={{
        width: "100%",
        flexDirection: "column",
        background: "#fff",
        margin: 0,
        paddingLeft: "5%",
        paddingRight: "5%",
        paddingTop: "10px",
      }}
    >
      <GridList
        style={{
          flexWrap: "nowrap",
          transform: "translateZ(0)",
        }}
      >
        {catCards()}
      </GridList>
    </div>
  );
};
