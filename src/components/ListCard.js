import "./styles/ListCard.css";
import React from "react";

const ListCard = (props) => {
  let classes = [
    "list-card-purple",
    "list-card-green",
    "list-card-brown",
    "list-card-blue",
    "list-card-pink",
    "list-card-orange",
  ];

  const getRandomClass = () => {
    return `list-card unselectable ${classes[parseInt(props.index + 3) % 6]}`;
  };

  return (
    <React.Fragment>
      <div className={getRandomClass()} title={props.description}>
        <h1 className="list-title">{props.title}</h1>
      </div>
    </React.Fragment>
  );
};

export default ListCard;
