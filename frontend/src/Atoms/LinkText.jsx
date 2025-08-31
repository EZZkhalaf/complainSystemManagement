import { Link } from "react-router-dom";

const LinkText = ({ text, header, path, textColor }) => {
  return (
    <p className={`mt-2 text-center text-sm ${textColor} `}>
      {header && <span> {header}</span>}
      <Link to={path} className={`${textColor} font-medium hover:underline`}>
        {text}
      </Link>
    </p>
  );
};

export default LinkText;
