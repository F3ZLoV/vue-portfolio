<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// --- 아이콘 import (lucide-vue-next) ---
import {
  Github,
  Mail,
  Menu,
  X,
  Sun,
  Moon,
  FileText,
  Loader2,
  Phone,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const basePath = import.meta.env.BASE_URL

import profileImage from './assets/images/profile.jpg'
import lostarkImage from './assets/images/lostark1.png'
import lostarkImage2 from './assets/images/lostarkImage2.jpg'
import emrImage from './assets/images/EMR.png'
import emrImage2 from './assets/images/EMR2.jpg'
import emrImage3 from './assets/images/EMR3.jpg'
import emrImage4 from './assets/images/EMR4.jpg'
import commuImage from './assets/images/commu.png'
import bankImage from './assets/images/bank_account.png'
import hamterImage from './assets/images/hamter.png'
import notionImage from './assets/images/notion.png'
import cicImage1 from './assets/images/CICIoT2023_1.png'
import cicImage2 from './assets/images/CICIoT2023_2.png'
import cicImage3 from './assets/images/CICIoT2023_3.png'
import f1ProjectImage from './assets/images/f1mr1.png'
import smartstudyImage from './assets/images/smartstudy_main.png'
import smartstudyImage2 from './assets/images/smartstudy_ai.png'
import smartstudyImage3 from './assets/images/smartstudy_architecture.png'
import smartstudyImage4 from './assets/images/smartstudy_erd.png'
import smartstudyImage5 from './assets/images/smartstudy_google_login.png'

import javaIcon from './assets/icons/java-original.png'
import springIcon from './assets/icons/spring-original.png'
import pythonIcon from './assets/icons/python-original.png'
import html5Icon from './assets/icons/html5-original.png'
import css3Icon from './assets/icons/css3-original.png'
import mysqlIcon from './assets/icons/mysql-original.png'
import oracleIcon from './assets/icons/oracle-original.png'
import gitIcon from './assets/icons/git-original.png'
import githubIcon from './assets/icons/github-original.png'
import awsIcon from './assets/icons/amazonwebservices-original-wordmark.png'
import dockerIcon from './assets/icons/docker-original.png'
import k8sIcon from './assets/icons/kubernetes-plain.png'

// --- 상태 관리 ---
const isDark = ref(false)
const isMenuOpen = ref(false)
const activeSection = ref('home')
const isLoading = ref(true)
const isExporting = ref(false)
const portfolioRef = ref(null)

// 모달 상태
const isModalOpen = ref(false)
const selectedProject = ref(null)
const currentScreenshotIndex = ref(0)

// 섹션 Refs
const sectionRefs = {
  home: ref(null),
  about: ref(null),
  projects: ref(null),
  contact: ref(null)
}

const navItems = ['home', 'about', 'projects', 'contact']

// --- 프로젝트 데이터 ---
const projects = [
  {
    featured: true,
    title: "Smart Study Messenger — AWS 서버리스 실시간 메신저",
    description: "Discord 스타일의 학습 협업 메신저. AWS Lambda 35개 + DynamoDB 7테이블 + SQS 비동기 큐 + Bedrock AI 분석 기반 서버리스 풀스택 프로젝트",
    tech: ["AWS Lambda", "API Gateway", "DynamoDB", "SQS", "Bedrock", "React"],
    image: smartstudyImage,
    github: "https://github.com/jeonghyeonme/CloudService",
    notion: "https://befitting-shark-cf5.notion.site/3-2e00f81ea81080aeaaa9c59610c336e9?pvs=74",
    details: {
      overview: "5인 팀 프로젝트의 백엔드 인프라 리드 담당. AWS Lambda 35개, REST/WebSocket API Gateway, DynamoDB 7테이블, SQS 비동기 큐, Bedrock Claude 3 Haiku 기반 AI 자료 분석 파이프라인을 단독으로 설계 및 배포함. 학부 IAM 제약(CloudFormation/IAM Role 생성 불가) 환경에서 Serverless Framework 같은 IaC 도구 없이 AWS CloudShell + bash 스크립트로 수동 cli 배포 파이프라인을 직접 구축하며 클라우드 인프라 운영을 깊이 경험함.",
      features: [
        "AWS Lambda 35개 + REST/WebSocket API Gateway + DynamoDB 7테이블 서버리스 아키텍처 단독 설계 및 배포",
        "WebSocket 기반 실시간 채팅 + 입력 중 알림(typing) + 프로필 변경 실시간 동기화(profileChanged) 구현",
        "Bedrock Claude 3 Haiku 멀티모달 API로 PDF/이미지 AI 자료 분석 파이프라인 구축 (스캔 PDF는 mupdf로 이미지 변환 후 처리)",
        "자체 JWT 인증 시스템 구축 (bcrypt + Refresh Token 멀티 디바이스 지원) + Google OAuth 통합 (id_token 검증 방식, Cognito 없이)",
        "SQS 비동기 큐로 채팅 메시지 버퍼링 + AI 분석 작업 처리 → API Gateway 30초 타임아웃 우회",
        "DynamoDB Conditional Write로 중복 AI 분석 방지 (멱등성 보장) + Connections 테이블 serverId-index GSI로 효율적 브로드캐스트"
      ],
      techStack: [
        "AWS Lambda (Node.js 20)",
        "API Gateway (REST + WebSocket)",
        "DynamoDB + GSI 설계",
        "Amazon SQS",
        "Amazon Bedrock (Claude 3 Haiku)",
        "Amazon Rekognition + Translate",
        "Amazon S3 (Pre-signed URL)",
        "React + WebSocket",
        "google-auth-library (Google OAuth)"
      ],
      troubleshooting: [
        {
          problem: "스캔된 PDF는 텍스트 레이어가 없어 Bedrock Converse API의 document 블록으로 입력 시 NO_TEXT_LAYER 에러 발생 (한국 대학 교재 대부분이 스캔본)",
          solution: "mupdf 라이브러리로 PDF 첫 5페이지를 2배 해상도 PNG 이미지로 변환 후 Bedrock의 멀티모달 image 블록으로 입력하는 폴백 흐름을 구축. mupdf가 ESM 전용 + top-level await을 사용해서 Lambda(CommonJS 환경)에서는 require()로 import 불가능했고, await import('mupdf')로 동적 import 처리해서 해결함."
        },
        {
          problem: "다수의 동시 사용자가 같은 파일을 분석 요청 시 Bedrock 호출 비용이 폭증할 위험 + 동일 작업 중복 실행 문제",
          solution: "DynamoDB Conditional Write로 멱등성 락 구현. Messages 테이블에 'serverId=AI_DEDUP_LOCK, messageId=<s3ObjectKey>' 특수 키로 attribute_not_exists 조건의 PUT을 시도해 이미 분석 중인 파일에 대한 중복 요청을 차단. TTL로 5분 후 자동 만료되어 재분석 가능하도록 설계함."
        },
        {
          problem: "학부 IAM 환경에서 CloudFormation, IAM Role 생성, Access Key 발급이 모두 차단되어 Serverless Framework/SAM 등 IaC 도구를 사용 불가",
          solution: "AWS CloudShell + bash 스크립트(deploy.sh, setup-api.sh)로 수동 cli 배포 파이프라인을 직접 구축. zip → S3 업로드 → update-function-code 흐름을 자동화하고, 신규 Lambda 추가 시 발생하는 권한 함정(get-function이 AccessDenied 반환 → 분기 깨짐)을 수동 create-function으로 우회하는 표준 절차를 수립함."
        },
        {
          problem: "프로필(닉네임/이미지) 변경 시 같은 서버 접속자들의 채팅창에 옛 닉네임이 그대로 표시되는 동기화 문제",
          solution: "Backend updateMe Lambda에서 ServerMembers Query → 각 서버별 Connections 테이블의 serverId-index GSI 조회 → 모든 활성 connection에 'profileChanged' 액션 브로드캐스트하는 로직 추가. Frontend는 useMemo로 members 배열을 O(1) lookup memberMap으로 변환해 메시지 렌더링 시 최신 닉네임/이미지를 동적 매핑. 탈퇴/추방된 멤버는 메시지 저장 시점 값으로 자연스럽게 fallback 처리."
        },
        {
          problem: "Textract로 한국어 PDF 분석 시 OCR 품질이 떨어지고 영문 위주 학습 모델로 한자 섞인 학술 자료 인식률 저조",
          solution: "Textract를 제거하고 Bedrock Converse API의 document 블록으로 PDF 바이너리를 직접 전달하는 방식으로 전환. 중간 인코딩 변환 단계가 사라져 한글 깨짐 문제도 자동 해결됐고, 기존 2단계 파이프라인(텍스트 추출 → 요약)을 1단계로 통합하여 비용과 응답 시간을 모두 개선함."
        },
        {
          problem: "Google OAuth 통합 시 자체 JWT 인증 구조 전체를 Cognito로 마이그레이션하는 대신 기존 구조 유지 방법 모색",
          solution: "Cognito 도입 시 35개 Lambda의 토큰 검증 로직 전체를 변경해야 하는 부담을 피하기 위해 id_token 검증 방식을 채택. google-auth-library의 verifyIdToken으로 Google 공개키 기반 서명 검증 + audience 클레임 확인을 거쳐 Client Secret 없이 안전하게 통합. 신규 Lambda 1개만 추가하고 기존 JWT 발급 흐름(createAccessToken/saveRefreshToken)을 그대로 활용해 마이그레이션 비용을 최소화함."
        }
      ],
      screenshots: [smartstudyImage, smartstudyImage2, smartstudyImage3, smartstudyImage4, smartstudyImage5]
    }
  },
  // {
  //   featured: true,
  //   title: "ML 기반 Kubernetes 사전 오토스케일링 — KSCI 논문",
  //   description: "LSTM·GRU·Ensemble 모델과 HPA를 7개 트래픽 시나리오 × 84 run으로 비교 평가. KEDA External Metrics API 연동, 자체 개발한 Lead Time 측정 도구, 'No Universal Winner' 명제 실증",
  //   tech: ["Kubernetes", "KEDA", "TensorFlow", "FastAPI", "LSTM/GRU", "Prometheus"],
  //   image: ksciPaperImage, // ← 대표 이미지 import 필요 (히트맵이나 시스템 아키텍처 다이어그램 추천)
  //   github: "https://github.com/F3ZLoV/ML-based-Kubernetes-Pre-AutoScaling",
  //   notion: "", // 노션 링크 있으면 추가
  //   details: {
  //     overview: "졸업논문 외 KSCI(한국컴퓨터정보학회) 저널 투고 논문. ML 기반 사전 오토스케일링을 Kubernetes 표준 HPA와 비교 평가하기 위해, DigitalOcean Kubernetes Service(DOKS) 클러스터에서 KEDA External Metrics API를 통해 LSTM, GRU, Ensemble 모델을 HPA와 동시 비교하는 시스템을 단독으로 설계·구축·운영함. 7개 트래픽 시나리오(SPIKE, STATIONARY, RAMP, PERIODIC archetype) × 4개 모델 × 3회 반복 = 84개 실험을 수행하여 912건의 스케일링 이벤트와 5종 운영 메트릭을 수집·분석함. 핵심 명제 'No Universal Winner — archetype-aware autoscaling needed'를 실측 데이터로 실증.",
  //     features: [
  //       "KEDA External Metrics API로 ML 추론 서버(FastAPI + TensorFlow)를 외부 메트릭 소스로 등록하여 LSTM/GRU/Ensemble 예측값이 직접 HPA 목표 파드 수가 되도록 통합",
  //       "Kubernetes Watch API 기반 자체 도구(lead_time_tracker)로 스케일 명령 발행부터 파드 Ready 도달까지의 운영적 지연(Lead Time)을 실시간 측정 — 기존 문헌이 정확도 지표(RMSE/MAPE)에 집중함으로써 놓친 운영 메트릭을 정량화",
  //       "Alibaba Cluster Trace 2018(72시간, 10초 단위) 공개 데이터셋으로 LSTM/GRU/Ensemble 모델 학습(look_back=60, 3-feature, Adam+MSE, Colab T4 GPU)",
  //       "7개 트래픽 시나리오(AWS spike, Alibaba spike/periodic/wiki + 합성 SPIKE/STEP/RAMP) 설계 — Wikipedia Pageview API 실측 데이터, Locust custom LoadShape로 부하 재현",
  //       "엄격한 초기 상태 통제 프로토콜 도입(wait_for_pods_settle 함수, 120초 cooldown, AI 서버 재시작) — 통제 여부에 따라 동일 archetype에서 결론이 반전될 수 있음을 실증",
  //       "Safety Guard 2단계 설계: 규칙 기반 하한선 max(1, ⌊user_count/20⌋) + 상태 기반 폴백(last_known_traffic 유지)으로 OOD 입력·일시적 통신 장애에서 시스템 안정성 확보"
  //     ],
  //     techStack: [
  //       "Kubernetes (DOKS, v1.31)",
  //       "KEDA 2.16 (External Metrics API)",
  //       "Python 3.12 + FastAPI 0.115",
  //       "TensorFlow 2.16 (LSTM/GRU/Ensemble)",
  //       "Prometheus + Grafana 모니터링",
  //       "Locust 2.43 (custom LoadShape)",
  //       "ngrok HTTPS Tunnel",
  //       "Alibaba Cluster Trace 2018"
  //     ],
  //     troubleshooting: [
  //       {
  //         problem: "초기 실험(Preliminary Phase)에서 모든 ML 모델이 HPA보다 현저히 부진한 결과를 보였는데, 데이터 분석 결과 직전 실험의 스케일 다운이 완료되지 않은 상태에서 다음 실험이 시작되어 클러스터 초기 상태가 일관되게 통제되지 않은 것이 원인으로 파악됨",
  //         solution: "wait_for_pods_settle() 함수를 도입해 Kubernetes API를 15초 간격으로 폴링하며 파드 수가 2개 이하로 수렴함을 검증한 후에만 다음 실험이 시작되도록 프로토콜을 강화함(최대 180초 대기, 미수렴 시 강제 재초기화). 환경 통제 후 GRU 모델이 HPA 대비 +15.1% 빠른 반응을 보여 동일 archetype에서 결론이 완전히 반전됨을 실증. 이는 ML 기반 오토스케일러 평가에서 초기 상태 통제가 결과 신뢰성의 전제 조건임을 보여주는 핵심 발견이 됨."
  //       },
  //       {
  //         problem: "AI 추론 서버에 일시적 네트워크 장애가 발생하면 last_known_traffic이 0으로 리셋되어 KEDA가 파드를 1개로 축소시키는 무한 리셋 문제. 또한 OOD 입력(학습 분포 벗어난 트래픽)에 대해 모델이 비정상적으로 낮은 예측값을 반환하여 가용성이 깨지는 사례 발생",
  //         solution: "Safety Guard 2단계 메커니즘 구축. 규칙 기반 하한선으로 max(1, ⌊user_count/20⌋) 최소 파드 수를 보장하여 AI 예측이 비정상적이어도 부하 테스트 결과 기반의 최소 가용성을 확보. 상태 기반 폴백으로 fetch_live_traffic 예외 시 last_known_traffic을 유지(0 리셋 X)하여 일시적 통신 실패에서도 시스템이 무한 리셋되지 않도록 처리. traffic_memory deque의 maxlen도 5에서 60(look_back과 일치)으로 수정하여 시계열 일관성 확보."
  //       },
  //       {
  //         problem: "Ensemble 모델(LSTM+GRU 가중 평균)이 일부 런에서 1개 → 25개 → 1개 → 25개로 급격하게 replica를 변동시키는 oscillation 현상 발생. 단일 시점에 24개 파드를 추가했다가 즉시 제거하여 클러스터 자원 효율성 저하 및 운영 비용 폭증 위험",
  //         solution: "원인 분석 결과 LSTM과 GRU의 예측이 상충할 때 가중 평균이 불안정하게 진동하는 것으로 파악됨. 이는 Zhang et al. AAPA 논문이 이론적으로 지적한 replica churn 문제의 실측 사례에 해당. 단순 가중 평균 결합이 아닌 변화율 제한(rate limiting)·히스테리시스(hysteresis) 등 안정화 메커니즘 동반의 필요성을 논문에 실무적 권고로 정리. 또한 학습 분포 변화 민감도 실험에서 Ensemble이 +81.7% 성능 저하로 분포 변화에 가장 취약한 결합 구조임을 추가 실증."
  //       },
  //       {
  //         problem: "초기 학습 데이터셋(AWS Kaggle)로 학습한 모델을 Alibaba 시나리오에서 평가하니 train-test 분포 불일치로 Ensemble이 Lead Time 2.57초 → 4.67초로 +81.7% 악화. 공개 데이터셋만으로 학습한 모델이 실제 운영 환경에서 부진할 수 있다는 분포 민감도 문제 직면",
  //         solution: "Alibaba Cluster Trace 2018 데이터셋으로 동일 모델 구조 재학습 후 양 데이터셋 결과를 직접 비교. AWS 학습 모델은 Ensemble이 1위지만 Alibaba 환경에서는 GRU가 가장 일관된 성능을 보이는 패턴 발견. scaler 파일도 aws_kaggle_scaler.pkl에서 alibaba_scaler.pkl로 교체하여 정규화 일관성 확보. 운영 환경에서는 공개 데이터셋만으로 학습하지 말고 실측 데이터 기반 주기적 재학습 파이프라인이 필수임을 논문 Discussion에서 실무적 권고로 도출."
  //       },
  //       {
  //         problem: "KEDA ScaledObject와 기존 HPA 객체가 충돌하면서 ScaledObject READY=False 상태가 되고 이벤트 로그조차 남지 않는 문제 발생. 실험 자동화 스크립트가 중간에 멈춤",
  //         solution: "원인을 추적한 결과 직전 실험의 HPA 객체가 제거되지 않은 채 새 ScaledObject를 적용해서 발생한 stale HPA 충돌로 파악. 실험 프로토콜에 'kubectl delete hpa --all -n default'를 ScaledObject 재적용 전에 반드시 실행하도록 명시. 또한 ngrok URL이 재시작마다 변경되는 문제도 keda-scaler.yaml을 매 실험마다 갱신하는 자동화 스크립트로 해결."
  //       },
  //       {
  //         problem: "DigitalOcean 노드 풀을 doctl CLI로 0으로 축소(--count 0)하는 명령이 불안정하게 동작하여 노드가 남아있는 채로 다음 실험이 시작되는 사례 발생",
  //         solution: "DigitalOcean 대시보드에서 수동으로 노드 풀을 0 ↔ 3 사이에서 조작하는 표준 절차로 변경. CLI 자동화는 포기하더라도 실험 재현성과 신뢰성을 우선시. 실험 자동화 스크립트는 노드 풀 조작은 사람이 하고, 그 외 HPA 삭제 → replica=2 리셋 → keda-scaler 재적용 → lead_time_tracker 시작 흐름을 자동화하는 형태로 분리 설계함."
  //       }
  //     ],
  //     screenshots: [ksciPaperImage] // 추가 스크린샷이 있다면 배열로 추가
  //   }
  // },
  {
    title: "CICIoT2023 데이터셋 기반 IoT 공격 탐지",
    description: "CICIoT2023 데이터셋을 기반으로 머신러닝 모델을 학습시켜 공격 트래픽 종류를 분류하는 모델 생성",
    tech: ["Python 3.11", "sklearn", "Pandas", "Numpy"],
    image: cicImage1,
    github: "https://github.com/F3ZLoV/Term_Project_CICIoT2023_ML",
    notion: "",
    details: {
      overview: "105개 실제 IoT 기기에 대한 최신 공격을 실행한 데이터 CICIoT2023 데이터셋을 기반으로 33종의 공격을 분류하는 ML 모델 생성",
      features: [
        "2, 8, 34-Class 분류로 그룹을 나누어 분류 모델 성능 테스트",
        "XGBoost와 LightGBM 부스팅 모델의 성능 비교 및 향상 테스트"
      ],
      techStack: ["Python 3.11", "sklearn", "Pandas", "Numpy"],
      troubleshooting: [
        {
          problem: "대용량 데이터셋(수십 GB) 로드시 메모리 부족(OOM) 현상 발생",
          solution: "Pandas의 chunksize 옵션을 활용해 데이터를 분할 로드하고, 데이터 타입을 최적화(float64 -> float32)하여 메모리 사용량을 효율적으로 관리함."
        },
        {
          problem: "DDoS 데이터 과밀집으로 인한 소수 클래스(Web, BruteForce) 탐지율 저조",
          solution: "클래스 불균형 해소를 위해 SMOTE 오버샘플링 기법을 적용하고, 모델 학습 시 scale_pos_weight 파라미터를 조정하여 소수 클래스의 가중치를 높임."
        }
      ],
      screenshots: [cicImage1, cicImage2, cicImage3]
    }
  },
  {
    title: "F1 레이싱 텔레메트리 데이터 파이프라인 구축",
    description: "FastF1 API를 활용해 2018-2026년 F1 레이스 데이터(랩 타임, 텔레메트리, 날씨)를 수집하고 MongoDB에 적재하는 ETL 파이프라인 개발",
    tech: ["Python", "MongoDB", "Pandas", "FastF1"],
    image: f1ProjectImage,
    github: "https://github.com/F3ZLoV/BigDataProject_Formula1_Telemetry",
    notion: "",
    details: {
      overview: "F1 레이싱의 초정밀 데이터 분석을 위해 FastF1 라이브러리를 사용하여 연도별 전 경기 데이터를 수집합니다. 랩 타임, 섹터 기록뿐만 아니라 초당 수십 회 발생하는 차량 텔레메트리(속도, RPM, 기어, 스로틀 등)를 MongoDB에 구조화하여 저장하는 백엔드 데이터 파이프라인입니다.",
      features: [
        "Smart Recovery Mode: 수집 중단 시 처음부터 다시 하지 않고, 메타데이터와 텔레메트리 데이터 유무를 확인해 누락된 세션만 선별 수집",
        "MongoDB 인덱싱 최적화: 연도/라운드/세션/드라이버 복합 인덱스를 적용하여 대용량 데이터 조회 속도 보장",
        "API 호출 안정성 확보: 랜덤 쿨다운(Sleep) 및 오류 발생 시 자동 재시도/로그 기록 시스템 구축"
      ],
      techStack: ["Python 3.11", "MongoDB", "FastF1", "Pandas", "NumPy"],
      troubleshooting: [
        {
          problem: "API 데이터 구조가 다른 '프리시즌 테스팅(Round 0)' 이벤트 호출 시 파이프라인 셧다운 발생",
          solution: "정규 시즌 데이터만 분석하기 위해 루프 진입 시 RoundNumber가 0인 경우를 감지하여 즉시 continue 처리하는 예외 처리를 추가, 전체 수집 프로세스의 연속성을 확보함."
        },
        {
          problem: "수십만 건의 텔레메트리 데이터 적재 중 네트워크 불안정으로 인한 부분 데이터 저장 문제",
          solution: "단순히 데이터 존재 여부만 체크하는 것이 아니라, 텔레메트리 데이터 개수(Count > 100)를 확인하여 데이터가 불완전하게 저장된 세션은 자동으로 재수집하도록 로직을 개선함."
        }
      ],
      screenshots: [f1ProjectImage]
    }
  },
  {
    title: "로스트아크 레이드 숙제 관리 페이지",
    description: "국내 MMORPG 로스트아크 API 활용 캐릭터/레이드 매칭 관리 서비스",
    tech: ["JSP/Servlet", "HTML", "Bootstrap", "MySQL"],
    image: lostarkImage,
    github: "https://github.com/F3ZLoV/LostArkRaidManager",
    notion: "https://www.notion.so/1e9a55bf89ae807b81e4d9b702e49169",
    details: {
      overview: "로스트아크 게임의 API를 활용하여 사용자의 캐릭터 정보를 불러오고, 주간/일일 숙제(레이드 등) 현황을 체크하며 관리할 수 있는 웹 서비스입니다.",
      features: [
        "로스트아크 Open API 연동을 통한 캐릭터 실시간 정보 조회",
        "주간 레이드 및 일일 숙제 체크리스트 기능",
        "반응형 웹 디자인 적용 (모바일/PC 지원)"
      ],
      techStack: ["Java 11", "JSP & Servlet", "MySQL 8.0", "Bootstrap 5"],
      troubleshooting: [
        {
          problem: "주간 숙제 초기화 스케줄러(WeeklyRaidResetTask)가 서버 재시작 시 누락되는 문제",
          solution: "서버 구동 시점(init)에 DB에 기록된 마지막 초기화 시간을 조회하고, 수요일 오전 6시가 지났다면 즉시 리셋 로직을 수행하도록 보정하여 스케줄러 안정성을 확보함."
        },
        {
          problem: "다수의 캐릭터 숙제 목록 조회 시 발생하는 N+1 쿼리 문제로 인한 로딩 지연",
          solution: "기존에 캐릭터별로 반복해서 숙제 테이블을 조회하던 로직을, SQL Join을 활용하여 한 번의 쿼리로 모든 캐릭터의 숙제 정보를 매핑해서 가져오도록 DAO 구조를 개선함."
        }
      ],
      screenshots: [lostarkImage, lostarkImage2]
    }
  },
  {
    title: "병원(이비인후과) EMR 프로젝트",
    description: "Spring Boot/JPA 기반 병원 진료/예약/데이터 관리 시스템 (EMR)",
    tech: ["Spring Boot", "Thymeleaf", "MySQL", "JPA"],
    image: emrImage,
    github: "https://github.com/F3ZLoV/Hospital_EMR",
    notion: "https://www.notion.so/Start-up-1ada55bf89ae80c8804bf36af1a7da83",
    details: {
      overview: "이비인후과 의원급 병원을 타겟으로 한 전자의무기록(EMR) 시스템입니다.",
      features: [
        "환자 대기열 실시간 관리 및 접수 시스템",
        "의사용 진료 차트 작성 및 과거 진료 이력 조회",
        "약품/상병 코드 검색 및 처방전 자동 생성"
      ],
      techStack: ["Java 17", "Spring Boot 3.0", "Spring Data JPA", "MySQL"],
      troubleshooting: [
        {
          problem: "환자 진료 이력 목록 조회 시 연관된 엔티티(진단, 처방) 로딩으로 인한 N+1 쿼리 성능 저하",
          solution: "단순 조회(findAll) 대신 JPQL의 'JOIN FETCH' 또는 @EntityGraph를 적용하여, 한 번의 쿼리로 환자와 연관된 진료 데이터를 즉시 로딩(Eager Loading)하도록 쿼리를 최적화함."
        },
        {
          problem: "다량의 처방전 PDF 생성 및 다운로드 요청 시 서버 메모리 부족(OOM) 및 응답 지연 발생",
          solution: "PDF 생성 로직(Flying Saucer)을 비동기 처리로 전환하고, 생성된 파일 스트림을 버퍼링하여 메모리 점유율을 낮추는 방식으로 리소스 관리를 개선함."
        }
      ],
      screenshots: [emrImage, emrImage2, emrImage3, emrImage4]
    }
  },
  {
    title: "Hi-Fi 사용자 커뮤니티 게시판",
    description: "AWS EC2 배포, 댓글/파일첨부 등 풀스택 커뮤니티 기능 구현",
    tech: ["JSP/Servlet", "HTML", "AWS EC2", "MySQL"],
    image: commuImage,
    github: "https://github.com/F3ZLoV/JSPProject-HiFi_Community",
    notion: "https://www.notion.so/S-W-7bd042a39cbc459ca5bac2af3379e39d",
    details: {
      overview: "오디오 애호가들을 위한 하이파이(Hi-Fi) 오디오 정보 공유 커뮤니티입니다.",
      features: [
        "회원가입, 로그인, 회원정보 수정",
        "게시판 CRUD 및 페이징 처리",
        "다중 파일 업로드 및 다운로드"
      ],
      techStack: ["Java", "JSP/Servlet", "MySQL", "AWS EC2"],
      troubleshooting: [
        {
          problem: "AWS EC2 서버 재배포 시 기존에 업로드했던 이미지 파일들이 모두 삭제되는 현상",
          solution: "파일 저장 경로를 프로젝트 내부(war)가 아닌 외부 절대 경로로 분리하고, Tomcat의 server.xml에서 <<Context>> 태그를 활용해 가상 경로(Virtual Path)를 매핑하여 해결함."
        },
        {
          problem: "게시글 작성 및 DB 저장 시 한글 데이터가 물음표(???)로 깨지는 인코딩 문제",
          solution: "JSP 상단의 setCharacterEncoding 설정뿐만 아니라, JDBC 연결 URL에 'useUnicode=true&characterEncoding=UTF-8' 옵션을 추가하여 DB 통신 구간의 인코딩을 통일함."
        }
      ],
      screenshots: [commuImage]
    }
  },
  {
    title: "은행 계좌 관리 시뮬레이터",
    description: "Java GUI 기반 계좌 생성/송금/관리 데스크탑 애플리케이션",
    tech: ["Java", "MySQL", "WindowBuilder"],
    image: bankImage,
    github: "https://github.com/F3ZLoV/BankAccountManage-WindowApp",
    notion: "https://www.notion.so/1e9a55bf89ae80ce9578d1eb6b9dfd1b",
    details: {
      overview: "Java Swing을 사용하여 개발한 데스크탑 은행 계좌 관리 프로그램입니다.",
      features: [
        "계좌 개설 (일반, 적금 예금 등)",
        "실시간 계좌 이체 및 잔액 조회",
        "기간별 거래 내역 조회"
      ],
      techStack: ["Java SE", "Swing", "MySQL", "JDBC"],
      troubleshooting: [
        {
          problem: "계좌 이체 도중 예외 발생 시, 송금자 잔액은 차감되었으나 수취인에게는 입금되지 않는 데이터 불일치(돈 증발) 위험 발견",
          solution: "JDBC Connection의 setAutoCommit(false)를 설정하여 송금, 입금, 내역 저장을 하나의 트랜잭션으로 묶고, 예외 발생 시 전체 작업을 Rollback하도록 구현하여 데이터 무결성을 보장함."
        }
      ],
      screenshots: [bankImage]
    }
  },
]

// --- 초기 로딩 ---
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
})

// --- 테마 토글 ---
const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// --- 스크롤 감지 및 진행률 ---
const { y } = useWindowScroll()

const scrollProgress = computed(() => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return '0%'
  }
  const height = document.body.offsetHeight - window.innerHeight
  if (height <= 0) return '0%'
  return (y.value / height) * 100 + '%'
})

watch(y, (newY) => {
  const scrollPosition = newY + 150
  const isAtBottom = window.innerHeight + newY >= document.body.offsetHeight - 10

  if (isAtBottom) {
    activeSection.value = 'contact'
    return
  }

  for (const section of navItems) {
    const element = sectionRefs[section].value
    if (element && scrollPosition >= element.offsetTop) {
      activeSection.value = section
    }
  }
})

const waitForImages = (element) =>
  Promise.all(
    Array.from(element.querySelectorAll('img')).map((img) =>
      img.complete && img.naturalHeight !== 0
        ? Promise.resolve()
        : new Promise((res) => { img.onload = img.onerror = res })
    )
  )

// --- PDF 내보내기 (새 탭 + 인쇄 창) ---
const handleExportPdf = async () => {
  isExporting.value = true
  await new Promise((resolve) => setTimeout(resolve, 100))

  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const targetSections = ['home', 'about', 'projects']

    for (let i = 0; i < targetSections.length; i++) {
      const sectionKey = targetSections[i]
      const sectionRef = sectionRefs[sectionKey].value

      let element = sectionRef?.querySelector('.a4-page')
      if (!element && sectionKey === 'projects') {
        element = sectionRef?.querySelector('.container')
      }

      if (element) {
        await waitForImages(element)
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          imageTimeout: 15000,
          logging: false,
          backgroundColor: isDark.value ? '#1e293b' : '#ffffff'
        })

        const imgData = canvas.toDataURL('image/png')

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        if (i < targetSections.length - 1) {
          pdf.addPage()
        }
      }
    }

    pdf.autoPrint()
    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')

  } catch (error) {
    console.error('PDF Error:', error)
    alert('PDF 변환 중 오류가 발생했습니다.')
  } finally {
    isExporting.value = false
  }
}

// --- 모달 관련 함수 ---
const openModal = (project) => {
  selectedProject.value = project
  currentScreenshotIndex.value = 0
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  selectedProject.value = null
  document.body.style.overflow = ''
}

const nextScreenshot = () => {
  if (!selectedProject.value) return
  const total = selectedProject.value.details.screenshots.length
  currentScreenshotIndex.value = (currentScreenshotIndex.value + 1) % total
}

const prevScreenshot = () => {
  if (!selectedProject.value) return
  const total = selectedProject.value.details.screenshots.length
  currentScreenshotIndex.value = (currentScreenshotIndex.value - 1 + total) % total
}
</script>

<template>
  <div :class="{ 'dark': isDark }">
    <div ref="portfolioRef" class="min-h-screen bg-background text-foreground transition-colors duration-300">

      <div class="fixed top-0 left-0 h-1 bg-primary z-50 transition-[width]" :style="{ width: scrollProgress }"></div>

      <div v-if="isLoading" class="fixed inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-500">
        <Loader2 class="w-16 h-16 text-primary animate-spin" />
      </div>

      <nav class="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
          <div class="text-xl font-bold text-primary">Tae-joon's Resume</div>
          <div class="flex items-center gap-4">
            <div class="hidden md:flex space-x-6 text-sm font-medium">
              <a
                  v-for="item in navItems"
                  :key="item"
                  :href="`#${item}`"
                  class="capitalize transition-colors hover:text-primary relative"
                  :class="activeSection === item ? 'text-primary' : 'text-muted-foreground'"
              >
                {{ item }}
                <span v-if="activeSection === item" class="absolute -bottom-[1.2rem] left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              </a>
            </div>

            <button
                class="w-9 h-9 relative flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                @click="toggleTheme"
            >
              <Sun
                  class="w-5 h-5 absolute transition-all duration-300"
                  :class="isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'"
              />
              <Moon
                  class="w-5 h-5 absolute transition-all duration-300"
                  :class="isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'"
              />
            </button>

            <button
                class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                @click="handleExportPdf"
                :disabled="isExporting"
            >
              <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
              <FileText v-else class="h-4 w-4" />
              {{ isExporting ? "Generating..." : "Print / Save PDF" }}
            </button>

            <button class="md:hidden p-2" @click="isMenuOpen = !isMenuOpen">
              <X v-if="isMenuOpen" class="w-6 h-6" />
              <Menu v-else class="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <section id="home" :ref="sectionRefs.home" class="pt-28 pb-16 flex justify-center px-4">
        <div class="a4-page bg-background text-foreground p-12 flex flex-col gap-8 max-w-[794px] w-full min-h-[1123px] relative overflow-hidden mx-auto box-border rounded-sm">

          <div class="flex items-center justify-between border-b-2 border-foreground pb-6">
            <div class="space-y-2">
              <h1 class="text-5xl font-extrabold tracking-tight">박태준</h1>
              <p class="text-xl font-semibold text-muted-foreground">Backend Developer & Cloud Engineer</p>
              <div class="flex flex-col gap-1 text-sm text-muted-foreground pt-2">
                <div class="flex items-center gap-2"><Phone class="w-3 h-3"/> 010-2483-5726</div>
                <div class="flex items-center gap-2"><Mail class="w-3 h-3"/> fsirtru@gmail.com</div>
                <div class="flex items-center gap-2"><Github class="w-3 h-3"/> github.com/F3ZLoV</div>
                <div class="flex items-center gap-2"><MapPin class="w-3 h-3"/> 인천시 서구</div>
              </div>
            </div>
            <div
              class="w-40 h-40 rounded-full overflow-hidden border-4 border-muted shadow-inner relative bg-cover bg-center flex-shrink-0"
              :style="{ backgroundImage: `url(${profileImage})` }"
              role="img"
              aria-label="Profile"
            ></div>
          </div>

          <div>
            <h2 class="text-xl font-bold mb-2 uppercase border-l-4 border-foreground pl-3">Profile</h2>
            <p class="text-sm leading-relaxed text-muted-foreground text-justify">
              컴퓨터 게임을 좋아하는 게이머로서 항상 사용자의 입장을 생각합니다. 단순한 기능 구현을 넘어 안정적인 백엔드 시스템 구축과 효율적인 클라우드 엔지니어링까지 경험하며, 모르는 것을 두려워하지 않고 끊임없이 성장하는 개발자가 되고 싶습니다.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-10 flex-grow">
            <div class="space-y-8">
              <div>
                <h2 class="text-xl font-bold mb-4 uppercase border-l-4 border-foreground pl-3">Education</h2>
                <div class="space-y-4">
                  <div class="relative pl-4 border-l-2 border-muted-foreground/20">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground"></div>
                    <h3 class="font-bold text-base">가좌고등학교</h3>
                    <p class="text-xs text-muted-foreground">~ 2020.02</p>
                  </div>
                  <div class="relative pl-4 border-l-2 border-muted-foreground/20">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground"></div>
                    <h3 class="font-bold text-base">인하공업전문대학</h3>
                    <p class="text-sm font-medium text-muted-foreground">컴퓨터정보과 (전문학사)</p>
                    <p class="text-xs text-muted-foreground">2020.03 ~ 2026.02</p>
                  </div>
                  <div class="relative pl-4 border-l-2 border-muted-foreground/20">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground"></div>
                    <h3 class="font-bold text-base">인하공업전문대학</h3>
                    <p class="text-sm font-medium text-muted-foreground">컴퓨터정보과 (공학사) (4년제 과정)</p>
                    <p class="text-xs text-muted-foreground">2026.03 ~ 2027.02 (예정)</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-8">
              <div>
                <h2 class="text-xl font-bold mb-4 uppercase border-l-4 border-foreground pl-3">Skills & Tools</h2>
                <div class="space-y-5">
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">Backend</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="javaIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Java <span class="text-green-600 font-bold">(상)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="springIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Spring Boot <span class="text-blue-600 font-bold">(중)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="pythonIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Python <span class="text-blue-600 font-bold">(중)</span></span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">Frontend</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="html5Icon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">HTML5 <span class="text-blue-600 font-bold">(중)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="css3Icon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">CSS3 <span class="text-blue-600 font-bold">(중)</span></span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">Database</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="mysqlIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">MySQL <span class="text-green-600 font-bold">(상)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="oracleIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Oracle <span class="text-yellow-600 font-bold">(하)</span></span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">DevOps</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="gitIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Git <span class="text-green-600 font-bold">(상)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="githubIcon" class="w-4 h-4 inline-block align-middle mr-1.5 dark:invert"/><span class="align-middle">GitHub <span class="text-green-600 font-bold">(상)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="awsIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">AWS <span class="text-blue-600 font-bold">(중)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="dockerIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Docker <span class="text-blue-600 font-bold">(중)</span></span>
                      </span>
                      <span class="inline-block px-3 py-1.5 rounded-full border text-xs font-semibold border-border text-foreground whitespace-nowrap leading-none">
                        <img :src="k8sIcon" class="w-4 h-4 inline-block align-middle mr-1.5"/><span class="align-middle">Kubernetes <span class="text-yellow-600 font-bold">(하)</span></span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" :ref="sectionRefs.about" class="py-16 flex justify-center px-4">
        <div class="a4-page bg-background text-foreground p-12 flex flex-col gap-10 max-w-[794px] w-full min-h-[1123px] relative overflow-hidden mx-auto box-border rounded-sm">
          <div class="border-b border-border pb-4">
            <h2 class="text-3xl font-bold">About Me</h2>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              나의 여정
            </h3>
            <p class="text-sm leading-7 text-muted-foreground text-justify">
              저는 '모르는 것을 두려워하지 않는 개발자'가 되고 싶습니다. 3학년 때 Spring 경험이 전무한 상태에서 병원 EMR 시스템 개발에 도전해, 강의와 공식 문서를 참고하며 Spring Boot를 독학했습니다. 그 결과 DB 연동부터 예약·진료 이력 관리까지 갖춘 시스템을 완성했고, '개발은 문제를 해결해나가는 과정'임을 깊이 체감했습니다.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              기술과 도전
            </h3>
            <p class="text-sm leading-7 text-muted-foreground text-justify">
              대학에서 쌓은 경험은 개발자로서의 토대가 되었지만, 동시에 배워야 할 것이 많다는 것도 깨달았습니다. 앞으로는 현장에서 직접 부딪히며 실전 경험을 쌓고, 실패를 두려워하지 않고 시행착오 속에서 단단하게 성장하는 개발자가 되겠습니다.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              미래로의 도약
            </h3>
            <p class="text-sm leading-7 text-muted-foreground text-justify">
              저는 대학에서의 다양한 강의와 과제 활동, 프로젝트를 통해 실무에서 필요한 기초 역량을 쌓는 귀중한 경험을 하였습니다. 이러한 경험들은 개발자로서의 토대를 다지는 데 큰 도움이 되었지만, 동시에 아직 배워야 할 것이 차고 넘친다는 사실도 깨달았습니다. <br/><br/>
              앞으로는 학교라는 울타리를 넘어 직접 현장에서 부딪혀 보며 실전 경험을 쌓고 싶습니다. 실패를 두려워하지 않고 그 속에서 교훈을 얻으며, 부족한 점을 스스로 파악해 끊임없이 성장해 나갈 것입니다. 단순히 빠른 결과만을 추구하기보다는, 시행착오를 겪고 스스로 고민하고 해결하는 과정들을 저의 소중한 자산이라 여기며 한 걸음씩 단단하게 전진하는 개발자가 되겠습니다.
            </p>
          </div>
        </div>
      </section>

      <section id="projects" :ref="sectionRefs.projects" class="py-24 px-4 bg-background">
        <div class="container mx-auto max-w-5xl">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold mb-4">Projects</h2>
            <div class="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <div
                v-for="(project, index) in projects"
                :key="index"
                class="group cursor-pointer"
                :class="{ 'md:col-span-2': project.featured }"
                @click="openModal(project)"
            >
              <div class="h-full flex flex-col bg-card border border-border/50 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                <div class="relative h-56 bg-muted overflow-hidden">
                  <img :src="project.image" :alt="project.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span class="text-white font-medium flex items-center gap-2">
                      <ExternalLink class="w-5 h-5" /> 상세 보기
                    </span>
                  </div>
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between">
                  <h3 class="text-xl font-semibold mb-2">{{ project.title }}</h3>
                  <p class="text-muted-foreground text-sm mb-4 line-clamp-3">{{ project.description }}</p>
                  <div class="flex flex-wrap gap-2 mt-auto">
                    <span v-for="tech in project.tech" :key="tech" class="px-2 py-1 rounded-full border border-border bg-secondary/50 text-xs">
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" :ref="sectionRefs.contact" class="py-24 px-4 bg-secondary/50">
        <div class="container mx-auto text-center">
          <div class="mb-10">
            <h2 class="text-4xl font-bold mb-4">Get In Touch</h2>
            <p class="text-muted-foreground max-w-2xl mx-auto">
              새로운 기회와 도전을 언제나 환영합니다. 궁금한 점이 있거나 협업 제안이 있다면 언제든 연락주세요.
            </p>
          </div>
          <div class="flex flex-col md:flex-row justify-center items-center gap-6">
            <a href="mailto:fsirtru@gmail.com" class="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
              <Mail class="w-5 h-5" /> Send Email
            </a>
            <a href="https://github.com/F3ZLoV" target="_blank" class="flex items-center gap-2 border border-input bg-background px-6 py-3 rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              <Github class="w-5 h-5" /> Visit GitHub
            </a>
          </div>
        </div>
      </section>

      <footer class="py-8 border-t border-border bg-background">
        <div class="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Park Tae-joon. Created with Vue.js & Tailwind CSS.</p>
        </div>
      </footer>

      <Transition name="fade">
        <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" @click.self="closeModal">
          <div class="bg-background w-full max-w-4xl h-[90vh] rounded-lg overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">

            <button class="absolute right-4 top-4 z-10 p-2 bg-background/50 rounded-full hover:bg-accent transition-colors" @click="closeModal">
              <X class="w-5 h-5" />
            </button>

            <div class="flex-1 overflow-y-auto p-6 md:p-8">
              <div class="mb-6">
                <h2 class="text-3xl font-bold mb-2">{{ selectedProject.title }}</h2>
                <div class="text-base flex flex-wrap gap-4 items-center mt-2 text-muted-foreground">
                  <a :href="selectedProject.github" target="_blank" class="flex items-center gap-1 hover:text-primary transition-colors">
                    <Github class="w-4 h-4" /> GitHub
                  </a>
                  <span class="hidden md:inline">|</span>
                  <a :href="selectedProject.notion" target="_blank" class="flex items-center gap-1 hover:text-primary transition-colors">
                    <img :src="notionImage" class="w-4 h-4" alt="notion" /> Notion
                  </a>
                </div>
              </div>

              <div class="space-y-10">
                <div class="w-full bg-muted/30 rounded-lg p-4 relative group">
                  <div class="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                    <img
                        :src="selectedProject.details.screenshots[currentScreenshotIndex]"
                        class="w-full h-full object-contain bg-black"
                    />
                  </div>

                  <button @click="prevScreenshot" class="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                    <ChevronLeft class="w-6 h-6" />
                  </button>
                  <button @click="nextScreenshot" class="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                    <ChevronRight class="w-6 h-6" />
                  </button>

                  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    <div
                        v-for="i in (selectedProject.details.screenshots.length)"
                        :key="i"
                        class="w-2 h-2 rounded-full transition-colors"
                        :class="(i-1) === currentScreenshotIndex ? 'bg-white' : 'bg-white/50'"
                    ></div>
                  </div>
                </div>

                <div>
                  <h3 class="text-xl font-bold mb-3 border-l-4 border-primary pl-3">프로젝트 개요</h3>
                  <p class="leading-7 text-muted-foreground">{{ selectedProject.details.overview }}</p>
                </div>

                <div>
                  <h3 class="text-xl font-bold mb-3 border-l-4 border-primary pl-3">주요 기능</h3>
                  <ul class="list-disc list-inside space-y-2 text-muted-foreground">
                    <li v-for="(feature, i) in selectedProject.details.features" :key="i">
                      {{ feature }}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-xl font-bold mb-3 border-l-4 border-primary pl-3">기술 스택</h3>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="tech in selectedProject.details.techStack" :key="tech" class="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-sm">
                      {{ tech }}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="text-xl font-bold mb-4 border-l-4 border-primary pl-3">트러블 슈팅</h3>
                  <div class="space-y-6">
                    <div v-for="(ts, i) in selectedProject.details.troubleshooting" :key="i" class="bg-secondary/20 p-5 rounded-lg border border-border/50">
                      <div class="mb-3">
                        <span class="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">Problem</span>
                        <p class="font-medium">{{ ts.problem }}</p>
                      </div>
                      <div class="pl-2 border-l-2 border-green-500/50">
                        <span class="inline-block bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded mb-1">Solution</span>
                        <p class="text-sm text-muted-foreground leading-relaxed">{{ ts.solution }}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style>
/* 나눔고딕 (Nanum Gothic) 폰트 import */
@import url("https://fonts.googleapis.com/earlyaccess/nanumgothic.css");

:root {
  --font-sans: 'Nanum Gothic', -apple-system, BlinkMacSystemFont, system-ui, Roboto,
  'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR',
  'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
}

body {
  font-family: var(--font-sans);
  font-weight: 400;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>