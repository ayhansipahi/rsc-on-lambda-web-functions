"use client";

import { useState } from "react";
import { Button } from "@base-ui/react/button";
import { buttonClass } from "./styles";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Button className={buttonClass} onClick={() => setCount((c) => c + 1)}>
      count: {count}
    </Button>
  );
}
