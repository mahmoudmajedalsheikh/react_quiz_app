import './index.css'
import Header from './Components/Header'
import Main from './Components/Main'
import {useReducer,useEffect} from 'react'
import Loader from './Components/Loader'
import Error from './Components/Error'
import StartScreen from './Components/StartScreen'
import Question from './Components/Question'
import NextButton from './Components/NextButton'
import Progress from './Components/Progress'
import FinishScreen from './Components/FinishScreen'
import Footer from './Components/Footer'
import Timer from './Components/Timer'
const SECS_PER_QUESTION = 30;

//-------Reducers Functions ------

const initialState ={
  questions:[],
  // 'loading' , 'error' , 'ready' , 'active' ,'finished'
  status:'loading',
  index:0,
  answer:null,
  points:0,
  highscore:0,
  secondsRemaining:null,
};

function reducer(state,action) {
  switch (action.type) {
    case 'dataReceived':
      return{
        ...state,
        questions:action.payload,
        status:'ready'
      }
      case 'dataFailed':
        return{
          ...state,
          status:'error'
      }
      case 'start':
        return{
          ...state,
          status:'active',
          secondsRemaining:state.questions.length * SECS_PER_QUESTION,
        }
      case 'newAnswer':
        const question = state.questions.at(state.index);

        return{
          ...state,
          answer:action.payload,
          points:action.payload === question.correctOption ? state.points + question.points :state.points,
        }
        case 'nextQuestion':
          return{
            ...state,
            index:state.index +1,
            answer:null
          }
          case 'finish':
            return{
              ...state,
              status:'finished',
              highscore:(state.points > state.highscore ? state.points:state.highscore)
            }
          case 'restart':
            return{
              ...initialState,
              questions:state.questions,
              status:'ready',
            }
            // return{
            //   ...state,
            //   index:0,
            //   points:0,
            //   highscore:0,
            //   answer:null,
            //   status:'ready',
            // }
            case 'tick':
            return{
              ...state,
              secondsRemaining:state.secondsRemaining -1,
              status:state.secondsRemaining === 0 ? 'finished':state.status
            }
    default:
      throw new Error('Action unknown')
  }
}

//--------------------- App ------------------
function App() {
//---------- States -------------
  // const [status, dispatch] = useReducer(reducer,initialState); //make destructuring
  const [{questions,status,index,answer,points,highscore,secondsRemaining}, dispatch] = useReducer(reducer,initialState);
  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((pre,cur)=> pre + cur.points ,0)
//-----------Side Effects--------
  useEffect(function(){
    fetch("http://localhost:8000/questions")
    .then((res)=>res.json())
    .then(data=> dispatch({type:'dataReceived',payload:data}))
    .catch(err=>dispatch({type:'dataFailed'}))
  }, []);
  
//-------------------------------
//-------------------------------


//------------ JSX --------------
  return(<div className='app'>
    <Header />
    <Main >
      {status === 'loading'  && <Loader/>}
      {status === 'error'  && <Error/>}
      {status === 'ready'  && <StartScreen numQuestions={numQuestions} dispatch={dispatch}/>}
      {status === 'active'  && 
      <>

      <Progress index={index} numQuestions={numQuestions} points={points} maxPossiblePoints={maxPossiblePoints} answer={answer}/>
      <Question 
      question={questions[index]} 
      dispatch={dispatch} 
      answer={answer}
      />
      <Footer>
      <Timer  dispatch={dispatch} secondsRemaining={secondsRemaining}/>
      <NextButton dispatch={dispatch} answer={answer} index ={index} numQuestions={numQuestions}/>
      </Footer>

      </>
      }
      {status === 'finished'  && 
      <FinishScreen
      maxPossiblePoints={maxPossiblePoints}
      points={points}
      highscore={highscore}
      dispatch={dispatch}
      />
      
      }
    </Main>

  </div>)
}

export default App
