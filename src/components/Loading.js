import React from "react";

import ReactLoading from "react-loading";

export default function Loading() {
  return (
    <div
      className="d-flex justify-content-center mt-5 g-pt-90"
      style={{ height: "-webkit-fill-available"}}
    >
      <ReactLoading
        type={"spin"}
        color={"#343a40"}
        height={"6%"}
        width={"6%"}
      />
    </div>
  );
}
