import React from "react";
import { LoaderAnimation } from "./ui/loader-card-animation.component.ui";

type Props = {};

export const Loader = (props: Props) => {
  const loadingItems = [
    {
      id: 7,
      letter: "L",
    },
    {
      id: 6,
      letter: "O",
    },
    {
      id: 5,
      letter: "A",
    },
    {
      id: 4,
      letter: "D",
    },
    {
      id: 3,
      letter: "I",
    },
    {
      id: 2,
      letter: "N",
    },
    {
      id: 1,
      letter: "G",
    },
  ];
  return <LoaderAnimation items={loadingItems} />;
};
