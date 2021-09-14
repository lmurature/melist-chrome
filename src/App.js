import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import ListCard from "./components/ListCard";
import store from "store";
import { Row, Col, Modal, Button, Alert } from "react-bootstrap";

function App(props) {
  const { refreshToken, tabUrl } = props;

  const [userData, setUserData] = useState(null);
  const [show, setShow] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState(null);
  const [listToAddItem, setListToAddItem] = useState(null);
  const [successAddItem, setSuccessAddItem] = useState(false);
  const [errorAddItem, setErrorAddItem] = useState(false);

  const [itemData, setItemData] = useState(null);
  const [userLists, setUserLists] = useState(null);

  useEffect(() => {
    axios
      .post("https://melist-api.herokuapp.com/api/users/auth/refresh_token", {
        refresh_token: refreshToken,
      })
      .then((response) => {
        let at = response.data.access_token;
        setAccessToken(at);

        if (!store.get("user_first_name")) {
          axios
            .get("https://melist-api.herokuapp.com/api/users/me", {
              headers: {
                Authorization: "Bearer " + at,
              },
            })
            .then((response) => {
              setUserData(response.data);
              store.set("user_first_name", response.data.first_name);
            })
            .catch((err) => setError(err));
        }

        axios
          .get(`https://melist-api.herokuapp.com/api/lists/get/all_owned`, {
            headers: {
              Authorization: "Bearer " + at,
            },
          })
          .then((response) => setUserLists(response.data))
          .catch((err) => setError(err));
      })
      .catch((err) => setError(err));

    if (tabUrl && isMeliUrl()) {
      if (isItem()) {
        axios
          .get(`https://api.mercadolibre.com/items/${getItemId()}`)
          .then((response) => setItemData(response.data))
          .catch((err) => setError(err));
      } else if (isProduct()) {
        axios
          .get(`https://api.mercadolibre.com/products/${getProductId()}`)
          .then((response) => {
            if (response.data.buy_box_winner) {
              let winnerItemId = response.data.buy_box_winner.item_id;
              axios
                .get(`https://api.mercadolibre.com/items/${winnerItemId}`)
                .then((response) => setItemData(response.data))
                .catch((err) => setError(err));
            }
          })
          .catch((err) => setError(err));
      }
    }
  }, refreshToken);

  const isItem = () => {
    return tabUrl.includes("https://articulo.mercadolibre.com.ar");
  };

  const isProduct = () => {
    return (
      (tabUrl.includes("https://www.mercadolibre.com.ar") ||
        tabUrl.includes("https://mercadolibre.com.ar")) &&
      tabUrl.split("MLA", 2).length > 1
    );
  };

  const getItemId = () => {
    let result = "MLA" + tabUrl.split("-", 2)[1];
    return result;
  };

  const getProductId = () => {
    let splitUrl = tabUrl.split("MLA", 2);
    let splitProduct = splitUrl[1].split("?", 2);
    return "MLA" + splitProduct[0];
  };

  const isMeliUrl = () => {
    return isItem() || isProduct();
  };

  const isMeliSite = () => {
    return tabUrl.includes("https://www.mercadolibre.com.ar");
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      setSuccessAddItem(false);
      setErrorAddItem(false);
    }, 10000);
  };

  const handleAddItem = () => {
    setSuccessAddItem(false);
    setErrorAddItem(false);
    axios
      .post(
        `https://melist-api.herokuapp.com/api/lists/${listToAddItem.id}/items/${itemData.id}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      )
      .then((response) => {
        setSuccessAddItem(true);
        handleClose();
      })
      .catch((err) => {
        setErrorAddItem(true);
        setError(err);
        handleClose();
      });
  };

  return (
    <div className="main">
      <div className="greetings">
        Bienvenido,
        {store.get("user_first_name") && " " + store.get("user_first_name")}
      </div>
      {isMeliUrl() ? (
        <React.Fragment>
          <Alert show={successAddItem} variant="success">
            ¡Producto agregado con éxito!
          </Alert>
          <Alert show={errorAddItem} variant="danger">
            Ocurrió un error al agregar este producto a tu lista. (Error:{" "}
            {error && JSON.stringify(error.response.data.message)})
          </Alert>
          <div className="detected-item">
            {itemData && (
              <React.Fragment>
                ¿Querés agregar{" "}
                <span className="item-title">{itemData.title}</span> a alguna de
                tus listas?
              </React.Fragment>
            )}
          </div>
          <Row>
            {userLists &&
              userLists.map((l, i) => {
                return (
                  <Col
                    onClick={() => {
                      setListToAddItem(l);
                      setShow(true);
                    }}
                    key={l.id}
                    lg={2}
                    md={3}
                    xl={2}
                    xs={3}
                    xxl={2}
                  >
                    <ListCard title={l.title} id={l.id} index={i} />
                  </Col>
                );
              })}
          </Row>
          <Modal size="sm" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Agregar producto a la lista</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Querés agregar este producto a la lista{" "}
              {listToAddItem && listToAddItem.title} ?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleAddItem}>
                Agregar
              </Button>
            </Modal.Footer>
          </Modal>
        </React.Fragment>
      ) : (
        <div className="not-meli-message">
          {isMeliSite() ? (
            <React.Fragment>
              Mirá las publicaciones y podrás agregarlas a cualquiera de tus
              listas de ME List.
            </React.Fragment>
          ) : (
            <React.Fragment>
              Navegá por{" "}
              <a href="https://www.mercadolibre.com.ar/" target="_blank">
                Mercado Libre
              </a>{" "}
              para agregar productos a tus listas en ME List.
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
