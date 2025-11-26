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
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
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
  const total = selectedProject.value.details.screenshots.length + 1
  currentScreenshotIndex.value = (currentScreenshotIndex.value + 1) % total
}

const prevScreenshot = () => {
  if (!selectedProject.value) return
  const total = selectedProject.value.details.screenshots.length + 1
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
            <div class="w-40 h-40 rounded-full overflow-hidden border-4 border-muted shadow-inner relative">
              <img :src="profileImage" alt="Profile" class="object-cover w-full h-full" />
            </div>
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

              <div>
                <h2 class="text-xl font-bold mb-4 uppercase border-l-4 border-foreground pl-3">Certification</h2>
                <div class="space-y-3 text-sm border-t border-border pt-2 text-muted-foreground">
                  <div class="flex justify-between border-b border-border pb-1">
                    <span class="font-semibold text-foreground">SQLD</span>
                    <span>2025.08</span>
                  </div>
                  <div class="flex justify-between border-b border-border pb-1">
                    <span class="font-semibold text-foreground">정보처리산업기사</span>
                    <span>2025.12</span>
                  </div>
                  <div class="flex justify-between border-b border-border pb-1">
                    <span class="font-semibold text-muted-foreground line-through">리눅스 마스터 2급</span>
                    <span class="line-through opacity-50">2026.03</span>
                  </div>
                  <div class="flex justify-between border-b border-border pb-1">
                    <span class="font-semibold text-muted-foreground line-through">AWS Cloud Practitioner</span>
                    <span class="line-through opacity-50">2026.04</span>
                  </div>
                  <div class="flex justify-between border-b border-border pb-1">
                    <span class="font-semibold text-muted-foreground line-through">AWS Solution Associate</span>
                    <span class="line-through opacity-50">2026.08</span>
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
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" class="w-4 h-4"/>
                        Java <span class="text-green-600 font-bold">(상)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" class="w-4 h-4"/>
                        Spring Boot <span class="text-green-600 font-bold">(상)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" class="w-4 h-4"/>
                        Python <span class="text-blue-600 font-bold">(중)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" class="w-4 h-4"/>
                        C++ <span class="text-yellow-600 font-bold">(하)</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">Frontend</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" class="w-4 h-4"/>
                        React <span class="text-blue-600 font-bold">(중)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" class="w-4 h-4 dark:invert"/>
                        Next.js <span class="text-blue-600 font-bold">(중)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" class="w-4 h-4"/>
                        HTML5 <span class="text-blue-600 font-bold">(중)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" class="w-4 h-4"/>
                        CSS3 <span class="text-blue-600 font-bold">(중)</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">Database</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" class="w-4 h-4"/>
                        MySQL <span class="text-green-600 font-bold">(상)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg" class="w-4 h-4"/>
                        MariaDB <span class="text-green-600 font-bold">(상)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" class="w-4 h-4"/>
                        Oracle <span class="text-yellow-600 font-bold">(하)</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-muted-foreground mb-2">DevOps</h3>
                    <div class="flex flex-wrap gap-2">
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" class="w-4 h-4"/>
                        Git <span class="text-green-600 font-bold">(상)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" class="w-4 h-4 dark:invert"/>
                        GitHub <span class="text-green-600 font-bold">(상)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" class="w-4 h-4"/>
                        AWS <span class="text-blue-600 font-bold">(중)</span>
                      </span>
                      <span class="px-3 py-1.5 rounded-full border text-xs font-semibold border-border flex items-center gap-2 text-foreground">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" class="w-4 h-4"/>
                        Docker <span class="text-blue-600 font-bold">(중)</span>
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
              저는 컴퓨터라곤 게임을 위한 도구로 밖에 모르던 고등학교 2학년 때, 친구와 함께 호기심으로 참가한 UNIST 슈퍼컴퓨팅 청소년 캠프를 통해 인생의 터닝포인트를 맞이했습니다. 4박 5일간의 짧은 시간이었지만 수준 높은 실습과 특강을 통해 처음으로 프로그래밍이라는 세계에 매료되었고, '내가 만드는 코드가 직접 동작한다'는 경험에 큰 흥미를 느꼈습니다. <br/><br/>
              당시에는 막연한 흥미였지만, 진로를 고민하던 시기에 그때의 강렬한 경험이 떠올라 주저 없이 컴퓨터공학 전공을 선택하였습니다. 대학에서는 컴퓨터 구조, 운영체제, 네트워크 등 전공 이론과 함께 다양한 팀/개인 프로젝트를 진행하며 실력을 쌓았고, 문서 작성과 협업 경험을 통해 문제 해결 중심의 사고 방식과 실무 역량을 키워나갔습니다.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              기술과 도전
            </h3>
            <p class="text-sm leading-7 text-muted-foreground text-justify">
              저는 '모르는 것을 두려워하지 않는 개발자'가 되고 싶습니다. 3학년 1학기에 병원 EMR 시스템 개발을 개인 프로젝트로 진행하려 할 때, Java 스킬만 다져놓은 상태였고 Spring에 대해서는 전무했습니다. 그러나 병원 업무 시스템을 제대로 구현하기 위해서는 백엔드 프레임워크가 필수적이라고 판단했고, 결국 Spring Boot의 기본부터 하나하나 독학해가며 시스템을 직접 구축하는 도전을 선택했습니다. <br/><br/>
              처음에는 REST API 설계조차 생소했지만, 관련 강의와 공식 문서를 참고해가며 기초를 다지고 작은 기능부터 직접 구현했습니다. 결과적으로 데이터베이스 연동부터 병원 예약 처리, 진료 이력 관리 등 하나의 완성된 시스템을 만들어 낼 수 있었고, 이 과정에서 '개발은 문제를 해결해나가는 과정'이라는 사실을 깊이 체감했습니다.
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
                        :src="currentScreenshotIndex === 0 ? selectedProject.image : selectedProject.details.screenshots[currentScreenshotIndex - 1]"
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
                        v-for="i in (selectedProject.details.screenshots.length + 1)"
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