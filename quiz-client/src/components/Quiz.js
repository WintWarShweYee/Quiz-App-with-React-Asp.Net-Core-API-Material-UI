import React, { useEffect, useState } from "react";
import useStateContext from "../hooks/useStateContext";
import { ENDPOINTS, createAPIEndpoint, BASE_URL } from "../api";
import {
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  List,
  ListItemButton,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";
import { getFormatedTime } from "../helper";
import { useNavigate } from "react-router";

export default function Quiz() {
  const [qns, setQns] = useState([]);
  const [qnsIndex, setQnsIndex] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const { context, setContext } = useStateContext();
  const navigate = useNavigate();

  let timer;

  const startTimer = () => {
    timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    setContext({
      timeTaken: 0,
      selectedOptions: [],
    });
    
    createAPIEndpoint(ENDPOINTS.question)
      .fetch()
      .then((res) => {
        setQns(res.data);        
      })
      .catch((err) => {
        console.log(err);
      });

    startTimer();

    return () => {
      clearInterval(timer);
    };
  }, []);

  const updateAnswer = (qnId, optionIdx) => {
    const temp = [...context.selectedOptions];
    temp.push({
      qnId,
      selected: optionIdx,
    });
    if (qnsIndex < 4) {
      setContext({ selectedOptions: [...temp] });
      setQnsIndex(qnsIndex + 1);
    } else {
      setContext({ selectedOptions: [...temp], timeTaken });
      navigate("/result");
    }
  };

  return qns.length != 0 ? (
    <Card
      sx={{
        maxWidth: 640,
        mx: "auto",
        mt: 5,
        "& .MuiCardHeader-action": { m: 0, alignSelf: "center" },
      }}
    >
      <CardHeader
        title={"Question " + (qnsIndex + 1) + " of 5"}
        action={<Typography>{getFormatedTime(timeTaken)}</Typography>}
      />
      <Box>
        <LinearProgress
          variant="determinate"
          value={((qnsIndex + 1) * 100) / 5}
        />
      </Box>
      {qns[qnsIndex].imageName != null
                    ? <CardMedia
                        component="img"
                        image={BASE_URL + 'images/' + qns[qnsIndex].imageName}
                        sx={{ width: 'auto', m: '10px auto' }} />
                    : null}
      <CardContent>
        <Typography variant="h6">{qns[qnsIndex].qnInWords}</Typography>
        <List>
          {qns[qnsIndex].options.map((item, idx) => (
            <ListItemButton
              key={idx}
              onClick={() => updateAnswer(qns[qnsIndex].qnId, idx)}
            >
              <div>
                <b>{String.fromCharCode(65 + idx) + " . "}</b>
                {item}
              </div>
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  ) : null;
}
