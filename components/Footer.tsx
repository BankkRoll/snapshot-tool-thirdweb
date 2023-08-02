import React from "react";
import styles from "../styles/Home.module.css";

const Footer: React.FC = () => {
  return (
    <div className={styles.footer}>
      <p className={styles.text}>
        Made with 🧠 by{" "}
        <a
          href="https://twitter.com/bankkroll"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          bankkroll
        </a>{" "}
      </p>
      <div className={styles.logo}>
        <a href="https://thirdweb.com/" target="_blank" rel="noopener noreferrer">
          <img
            src="/thirdweb.svg"
            alt="Thirdweb Logo"
            width={60}
            className={styles.image}
          />
        </a>
      </div>
    </div>
  );
};

export default Footer;




