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
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const basePath = import.meta.env.BASE_URL

import profileImage from './assets/images/profile.png'
import emrImage from './assets/images/EMR.png'
import emrImage2 from './assets/images/EMR2.jpg'
import emrImage3 from './assets/images/EMR3.jpg'
import emrImage4 from './assets/images/EMR4.jpg'
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
import onpremImage from './assets/images/onprem_3tier.svg'
import opFailover1 from './assets/images/failover-1-normal.png'
import opFailover2 from './assets/images/failover-2-down.png'
import opFailover3 from './assets/images/failover-3-recovered.png'
import opHaproxyOk from './assets/images/HAProxy_stats.png'
import opHaproxyDown from './assets/images/HAProxy_stats_web1Down.png'
import opAlertPending from './assets/images/Prometheus_Alert_PENDING.png'
import opAlertFiring from './assets/images/Prometheus_Alert_FIRING.png'
import opGrafana from './assets/images/Grafana_Dashborad.png'
import opFirewall from './assets/images/Firewall-Policy.png'
import opChanged0 from './assets/images/Idempotent_changed0.png'
import holdfastImage from './assets/images/holdfast_aws.svg'
import hfHarness from './assets/images/hf-measurement-harness.svg'
import hfOversell from './assets/images/hf-m3-oversell-by-contention.svg'
import hfPageTiming from './assets/images/hf-per002-page-timing.svg'
import hfReqCoverage from './assets/images/hf-requirements-coverage.svg'
import ksciImage1 from './assets/images/fig1.png'
import ksciImage2 from './assets/images/fig2.png'
import ksciImage3 from './assets/images/fig4.png'
import ksciImage4 from './assets/images/fig7.png'
import ksciImage5 from './assets/images/fig8.png'

import linuxIcon from './assets/icons/linux-original.png'
import bashIcon from './assets/icons/bash-original.png'
import nginxIcon from './assets/icons/nginx-original.png'
import ansibleIcon from './assets/icons/ansible-original.png'
import terraformIcon from './assets/icons/terraform-original.png'
import prometheusIcon from './assets/icons/prometheus-original.png'
import grafanaIcon from './assets/icons/grafana-original.png'
import postgresIcon from './assets/icons/postgresql-original.png'
import mysqlIcon from './assets/icons/mysql-original.png'
import awsIcon from './assets/icons/amazonwebservices-original-wordmark.png'
import dockerIcon from './assets/icons/docker-original.png'
import k8sIcon from './assets/icons/kubernetes-plain.png'
import springIcon from './assets/icons/spring-original.png'
import pythonIcon from './assets/icons/python-original.png'
import gitIcon from './assets/icons/git-original.png'

// --- 스킬 (직접 설치·구성하고 장애를 겪어본 범위만) ---
const skillGroups = [
  {
    category: 'Linux & Server',
    items: [
      { name: 'Rocky Linux 9 / RHEL', level: '중', icon: linuxIcon, invert: true },
      { name: 'Shell Script', level: '중', icon: bashIcon, invert: true },
      { name: 'SELinux · LVM', level: '초' }
    ]
  },
  {
    category: 'High Availability',
    items: [
      { name: 'HAProxy', level: '중' },
      { name: 'Keepalived / VRRP', level: '초' },
      { name: 'Nginx', level: '초', icon: nginxIcon }
    ]
  },
  {
    category: 'Automation & Monitoring',
    items: [
      { name: 'Terraform', level: '초', icon: terraformIcon },
      { name: 'Ansible', level: '초', icon: ansibleIcon, invert: true },
      { name: 'Prometheus', level: '초', icon: prometheusIcon },
      { name: 'Grafana', level: '초', icon: grafanaIcon }
    ]
  },
  {
    category: 'Database',
    items: [
      { name: 'PostgreSQL 스트리밍 복제', level: '초', icon: postgresIcon },
      { name: 'MySQL', level: '초', icon: mysqlIcon }
    ]
  },
  {
    category: 'Cloud & Container',
    items: [
      { name: 'AWS', level: '중', icon: awsIcon },
      { name: 'Docker', level: '중', icon: dockerIcon },
      { name: 'Kubernetes', level: '초', icon: k8sIcon }
    ]
  },
  {
    category: 'Development',
    items: [
      { name: 'Java / Spring Boot', level: '초', icon: springIcon },
      { name: 'Python', level: '초', icon: pythonIcon },
      { name: 'Git', level: '중', icon: gitIcon }
    ]
  }
]

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
    title: "온프레미스 3-Tier 고가용성 인프라 구축",
    period: "2026.08 ~ 2026.09 · 개인 프로젝트 · 7주",
    description: "VM 7대로 로드밸런서–웹–DB 3계층을 구축하고 계층별 이중화·복제·백업·관측·접근제어를 Ansible로 코드화. 각 계층마다 의도적으로 장애를 유발해 복구 과정을 검증했고, 전체 플레이북 재실행 시 changed=0으로 수렴하는 것을 확인해 재현 가능성을 증명",
    tech: ["Rocky Linux 9", "Ansible", "HAProxy", "Keepalived", "Nginx", "PostgreSQL", "Prometheus", "Grafana", "Loki", "LVM", "SELinux", "firewalld"],
    image: onpremImage,
    github: "https://github.com/F3ZLoV/onprem-3tier",
    notion: "",
    details: {
      overview: "관리형 서비스가 대신 처리해주던 계층을 직접 만들어보기 위해 Rocky Linux 9 VM 7대로 로드밸런서–웹–DB 3계층을 구축한 개인 프로젝트(7주). 이중화·복제·백업·관측·접근제어를 하나씩 붙이고, 구성했다고 끝내는 대신 각 계층마다 의도적으로 장애를 유발해 복구 과정을 확인하는 것을 원칙으로 함. 장애 드릴 5건 — 웹 서버 정지 / LB MASTER 정지 / 디스크 소진 / primary DROP TABLE / 접근 제어 적용 — 을 직접 일으켜 무중단 여부, 페일오버 다운타임, 알림 발화와 자동 해제, 백업 선택 복구, 차단 동작을 각각 확인함. 전 구성은 Ansible 롤 13개·플레이북 7개로 코드화했고, 전체 재실행 시 7개 노드 전부 changed=0으로 수렴하는 것을 확인해 재현 가능성을 증명함. SELinux는 enforcing을 유지한 상태로 구축을 마쳤으며, 구축 중 마주친 트러블슈팅 17건을 문서로 기록함.",
      features: [
        "HAProxy L7(HTTP) 로드밸런싱 + HTTP 헬스체크로 백엔드 자동 장애 제외. 웹 서버 1대 정지 시 무중단 서비스 검증",
        "Keepalived VRRP 기반 VIP 페일오버 구성. MASTER 노드 강제 종료 시 1초 간격 curl 루프로 측정한 실제 다운타임 약 1초 확인",
        "PostgreSQL 스트리밍 복제(primary/replica) 및 LVM 전용 데이터 볼륨 분리. 동일 롤에서 pg_role 변수로 역할별 task를 분기 배포",
        "systemd timer 기반 일일 자동 백업 구축. 운영자 실수를 시뮬레이션해 DROP TABLE이 replica까지 전파되는 것을 확인하고, 백업에서 해당 테이블만 선택 복구하여 검증",
        "Prometheus·Grafana·Alertmanager·Loki로 전 노드 메트릭·로그 통합 관측. 디스크 소진을 유발해 알림 발화부터 자동 해제까지 전 과정 검증",
        "방화벽을 포트 개방 여부에서 출발지 기반 접근 제어로 전환. 웹 80번은 로드밸런서에서만, DB 5432는 DB 노드 상호간에만 허용. 적용 후 웹 직접 접근이 차단되고 LB 경유 서비스는 정상인 것을 확인",
        "SELinux enforcing 유지 상태로 구축 — semanage 포트 라벨링, restorecon 컨텍스트 복원으로 정책 준수. 자격증명은 Ansible Vault 암호화",
        "Ansible 롤 13개 · 플레이북 7개로 전 구성 코드화. 전체 재실행 시 7개 노드 전부 changed=0 확인. 이 중 db-replication은 이미 동작 중인 복제를 재구성할 위험이 있어 syntax-check·dry-run까지만 수행하고 신규 구축 재현용으로 남겨둠",
        "구축 중 마주친 트러블슈팅 17건을 증상·원인·해결 구조로 문서화 (docs/troubleshooting.md)"
      ],
      techStack: [
        "Rocky Linux 9",
        "HAProxy (L7 · HTTP 헬스체크)",
        "Keepalived (VRRP / VIP)",
        "Nginx",
        "PostgreSQL (스트리밍 복제)",
        "Ansible (롤 13 · 플레이북 7 · Vault)",
        "systemd timer (일일 백업)",
        "Prometheus + Alertmanager",
        "Grafana",
        "Loki",
        "LVM",
        "SELinux (semanage / restorecon)",
        "firewalld (출발지 기반 접근 제어)"
      ],
      troubleshooting: [
        {
          id: "①",
          problem: "설정이 정상인데 적용되지 않은 pg_hba.conf (2일 소요)",
          steps: [
            { label: "문제", text: "PostgreSQL 복제 접속이 지속 거부. 설정 파일에 허용 규칙이 존재하고 pg_hba_file_rules 뷰에서 정상 파싱까지 확인됐으나 런타임 매칭 실패." },
            { label: "접근", text: "변수를 단계적으로 배제하며 범위 축소 — 인증 방식을 trust로 변경해 인증 계층 배제 / 주소를 0.0.0.0/0으로 확대해 범위 문제 배제 / primary가 자기 자신에게 복제 접속을 시도해 네트워크·클라이언트 배제. 세 계층이 모두 배제되어 설정 파일 자체의 문제로 특정." },
            { label: "원인", text: "sed 기반 반복 편집으로 파일에 누적된 비가시적 손상." },
            { label: "해결", text: "부분 수정 대신 파일 전체를 재생성. 이후 동일 문제 방지를 위해 Ansible template 모듈로 전체를 생성하는 방식으로 전환." }
          ]
        },
        {
          id: "②",
          problem: "파괴적 작업으로 인한 데이터 손실과 코드 레벨 방어",
          steps: [
            { label: "문제", text: "중첩 SSH 세션에서 대상 서버를 착각해 primary DB의 데이터 디렉토리를 삭제." },
            { label: "복구", text: "initdb로 클러스터 재생성 후 복제 설정·계정 재구성 (LVM 마운트는 유지되어 스토리지 계층 재작업 불필요)." },
            { label: "개선", text: "사후 조치에 그치지 않고 자동화 코드에 멱등성 가드 추가. pg_basebackup은 데이터 디렉토리를 비우는 파괴적 작업이므로, standby.signal 존재 여부로 이미 구성된 replica에서는 관련 task 전체를 skip하도록 구성." }
          ],
          code: "- name: Check if replica is already configured\n  ansible.builtin.stat:\n    path: \"{{ pg_data_dir }}/standby.signal\"\n  register: standby_signal\n\n# 이하 파괴적 task 전체에 다음 조건을 적용\n# when: not standby_signal.stat.exists"
        },
        {
          id: "③",
          problem: "재현 검증에서 발견한 설정 드리프트",
          steps: [
            { label: "문제", text: "전체 플레이북 재실행 시 changed가 계속 발생. 확인 결과 서비스 롤이 포트를 열고 방화벽 롤이 같은 포트를 닫고 있었음." },
            { label: "영향", text: "실행 순서에 따라 최종 상태가 달라지는 불안정한 구성. 단일 플레이북만 실행할 때는 드러나지 않음." },
            { label: "해결", text: "관심사 분리 — 서비스 롤에서 방화벽 task를 제거하고 접근 제어는 firewall 롤이 단독 관리. 수정 후 전 노드 changed=0 수렴." }
          ],
          rule: "하나의 자원은 하나의 주체가 관리해야 한다. 최초 구축 성공만으로 재현 가능성을 주장할 수 없으며, 전체 재실행 검증이 필요하다."
        }
      ],
      screenshots: [
        onpremImage,
        opFailover1, opFailover2, opFailover3,
        opHaproxyOk, opHaproxyDown,
        opAlertPending, opAlertFiring,
        opGrafana,
        opFirewall,
        opChanged0
      ]
    }
  },
  {
    featured: true,
    title: "HoldFast — 좌석 예약 시스템 AWS 배포 인프라",
    period: "2026.08 ~ 진행 중 · 2인 졸업작품 · 인프라·배포 전담",
    description: "공공기관 RFP 기반 좌석 예약 시스템의 AWS 인프라를 Terraform으로 전 구성 코드화. VPC 2AZ·ALB·ECS Fargate 2대·RDS를 배포하고, 잘못된 apply를 사람 판단이 아니라 스크립트가 막도록 가드레일을 코드로 박음. 내린 뒤 잔여 과금 0 실측",
    tech: ["Terraform", "AWS ECS Fargate", "ALB", "RDS PostgreSQL", "VPC 2AZ", "ACM", "SSM", "CloudWatch"],
    image: holdfastImage,
    github: "https://github.com/inhalab/holdfast",
    notion: "",
    details: {
      overview: "2인 졸업작품(2026.08.31 착수, 12.07 최종 발표 예정)의 AWS 배포·운영 구간 전담. 주제 선정 기준은 「정량 검수 기준이 있는가」였고, ‘정원 초과 승인 0건’·‘화면 응답 3초 이내’처럼 주관적 평가가 아니라 측정으로 답할 수 있는 조건이 명시된 공공기관 제안요청서(RFP)를 골랐음. 그 결과 목표가 ‘기능을 다 만든다’가 아니라 ‘동시성 제어가 됐다는 증거를 만든다’가 됨. 좌석 예약은 같은 자원(좌석 1석)에 여러 요청이 몰리는 구조라 그 증거를 만들기 좋은 도메인. 역할은 동시성 코어를 팀원이 맡고, 본인은 화면 계층과 인프라·배포·운영을 전담함. Terraform으로 VPC 2AZ부터 ALB·ECS Fargate·RDS까지 전 구성을 코드화하고, 잘못된 apply를 사람 판단이 아니라 단일 진입점 스크립트가 막도록 가드레일을 코드로 박았음. 검증 과정에서 teardown 판정 기준·state 밖 리소스·검증 도구 무동작 등 「틀린 것을 찾아 고친 기록」이 남았고, 내린 뒤 잔여 과금 0을 실측으로 확인함. RFP의 정량 조건은 숫자로 답함 — 초과 예약 0건(락 전략 4종 36회 전부 0), 응답시간 p95 3초 이내(API 18~41ms), 본인이 담당한 화면 13개 중 가장 느린 화면 45.9ms. 미완 — 엣지와 애플리케이션이 동시에 떠 있는 상태로는 아직 통합 검증하지 않았고(두 구간을 따로 확인), 모니터링·알림 체계가 없으며 단일 리전·단일 환경, CI에서 apply는 하지 않음.",
      features: [
        "Terraform으로 전 구성 코드화 — VPC 2AZ 퍼블릭 서브넷 · ALB(HTTPS) · ECS Fargate · RDS PostgreSQL · ACM 와일드카드 인증서 · SSM Parameter Store · ECR(수명주기 정책) · CloudWatch Logs",
        "앱 2대 구성 — 태스크 정의 1개에 desired_count 2. 각 태스크가 메타데이터에서 자기 ID를 읽어 화면에 표시해 ‘정말 2대인가’를 눈으로 확인 가능하게 함. 1대면 애플리케이션 내부 락만으로도 초과 확정 0이 나와 프로젝트 결론이 서지 않기 때문",
        "설계 판단 ① NAT Gateway 안 세움 — 퍼블릭 서브넷 구성이면 불필요하므로 만들지 않음. 대가로 보안그룹이 유일한 방어선이 됨",
        "설계 판단 ② ALB를 인터넷 전체에 열지 않음 — CDN 게시 대역만 허용하고, 대역 목록은 apply 시점에 API로 받아옴(하드코딩 안 함). 직행 경로가 열리면 엣지에 둔 관리자 인증이 무의미해지기 때문",
        "설계 판단 ③ 헬스체크에 /actuator 안 씀 — 로컬에서 이 앱의 /actuator/health가 캐시 미사용 시 503을 낸다는 것을 먼저 실측함. 배포 구성에는 캐시 계층이 없으므로 그대로 쓰면 앱은 정상인데 전 타겟이 unhealthy가 됨. /api/health로 고정(200을 내고 의존성 상태는 본문에 실음). 겪고 고친 게 아니라, 다른 환경에서 잰 값을 근거로 미리 피한 경우",
        "설계 판단 ④ 캐시 계층 안 세움 — 시연 구성과 배포 구성을 같게 유지하기 위해 배포 쪽에도 캐시를 두지 않음",
        "엣지 보안 — 관리자 서브도메인을 CDN의 Zero Trust로 보호하되 애플리케이션은 그 인증을 모름(인증 로직이 앱에 들어가지 않음). TLS는 엣지↔오리진 구간까지 암호화, 와일드카드 인증서 1장으로 검증 레코드를 1개로 축소",
        "계정 경계 설계 — 도메인·Zero Trust는 팀원 계정, AWS 리소스는 본인 계정. 서로를 IAM에 초대하는 대신 「DNS 레코드 쓰기」만 가능한 최소 권한 토큰을 받아 Terraform이 DNS를 직접 관리 → 배포마다 사람을 기다리던 단계 제거",
        "운영 스크립트에 가드레일을 코드로 박음(단일 진입점 셸) — 지정한 IAM 사용자가 아니면 apply 거부 / plan에 NAT Gateway가 있으면 apply 거부 / 임시 접근 구멍이 plan에 있으면 멈추고 사람이 확인 문구를 직접 입력해야 통과 / 무과금 구간 → DB → 엣지 → 전체 단계별 apply로 앞단이 틀리면 비싼 것을 세우기 전에 드러나게 함 / 비용 시계를 apply 이전에 시작",
        "비용 통제 — 학생 크레딧 수령 경로 3개를 모두 확인해 전부 해당 없음을 확인하고 실비 집행. 예산 경보는 갱신 지연이 8~12시간이라 실시간 방어가 아님을 확인하고 즉시 teardown을 유일한 통제 수단으로 설계. 실측 전체 스택 검증 0.4시간 / 엣지 구간 검증 0.1시간, 각각 $0.1 미만, 내린 뒤 잔여 과금 0",
        "검수 기준을 숫자로 마감 — 요구사항 14개를 추적표로 관리해 충족 10건·부분 4건까지 상태를 공개. 초과 예약 0건(REQ-01)은 락 전략 4종 36회 측정에서 전부 0, 락이 없는 베이스라인은 극단 경합에서 3~5건 발생해 대조군이 성립. 응답시간 p95 3초 이내(REQ-10)는 API 18~41ms. 본인이 맡은 화면 계층은 화면 13개 중 가장 느린 화면이 45.9ms로 기준 3000ms의 1.5%",
        "기반·측정 설계(팀 공통 구간) — 저장소·CI·설계 문서·역할 경계를 착수 당일 세우고 CODEOWNERS로 리뷰 책임을 경로 단위 분할. 락이 없는 베이스라인을 먼저 완성해 좌석 10석에 500명이 붙을 때 정원을 넘겨 확정되는 것을 3회 측정으로 재현한 뒤, 락 전략 4종을 환경변수 하나로 전환되게 인터페이스 뒤에 배치해 전략 5종 × 경합도 3단계 × 3회 = 60회 비교 측정 (동시성 코어 구현은 팀원 담당)"
      ],
      techStack: [
        "Terraform",
        "AWS ECS Fargate",
        "ALB (HTTPS)",
        "Amazon RDS PostgreSQL",
        "VPC (2AZ 퍼블릭 서브넷)",
        "ACM (와일드카드 인증서)",
        "SSM Parameter Store",
        "ECR (수명주기 정책)",
        "CloudWatch Logs",
        "CDN Zero Trust (엣지 인증)",
        "Shell Script (배포 가드레일)",
        "Spring Boot 4.1 / Java 25",
        "Thymeleaf + htmx (화면 계층)",
        "k6 (부하 측정)"
      ],
      troubleshooting: [
        {
          id: "T-1",
          problem: "다 내렸는데 teardown 검증이 실패로 끝났다",
          symptom: "리소스를 전부 제거했는데 검증 스크립트가 「남아 있음」으로 판정.",
          cause: "판정을 태그 조회로 했다. 과금되지 않는 잔여 객체가 태그에 잡혔고, 태그 API 자체에도 갱신 지연이 있었다.",
          action: "판정 기준을 「태그가 비었나」에서 「과금되는 리소스가 있나」로 바꾸고, 태그나 Terraform state를 믿지 않고 AWS에 직접 질의해 세도록 수정.",
          rule: "정리 검증은 「깨끗해 보이나」가 아니라 「돈이 나가나」로 판정한다. 중간 표현(태그·state)을 믿으면 둘 다 틀릴 수 있다."
        },
        {
          id: "T-2",
          problem: "apply를 중단하자 Terraform이 모르는 리소스가 남았다",
          symptom: "생성 중 중단한 뒤 destroy를 돌렸는데 DB 인스턴스가 그대로 살아 있었다.",
          cause: "리소스는 생성됐지만 state에 기록되기 전에 프로세스가 끊겼다. state에 없으니 destroy의 대상이 아니다.",
          action: "CLI로 직접 삭제하고 잔여 과금 없음을 다시 확인. 이 잔여물을 발견한 수단이 바로 앞 T-1에서 바꿔 둔 판정 방식이었다. 앞의 수정이 없었으면 과금이 계속됐을 것이다.",
          rule: "「destroy가 유일한 방어」라는 전제에는 선행 조건이 있다. apply가 정상 종료했을 때만 성립하며, 이 경로를 문서에 명시했다."
        },
        {
          id: "T-3",
          problem: "단계별 apply가 전체 apply에 가려져 있던 의존성 누락을 드러냈다",
          symptom: "단계를 나눠 올리면 ① 요청이 오류도 없이 무응답 ② 인증서 검증이 10분 뒤 타임아웃 ③ 외부로 나가는 경로가 없음 — 증상이 매번 달랐다.",
          cause: "보안그룹 규칙·라우트 테이블 연결·인증서 검증용 DNS 레코드가 의존 그래프상 어느 리소스에서도 참조되지 않는 노드였다. 부분 대상 지정이 이들을 통째로 빼 버린다. 전체 apply에서는 우연히 순서가 맞아 드러나지 않았다.",
          action: "해당 단계가 네트워크 계층을 통째로 포함하도록 범위를 재정의하고, 누락되던 리소스에는 명시적 의존을 선언.",
          rule: "전체 apply가 성공한다고 의존 관계가 선언된 것은 아니다. 부분 배포는 기능이 아니라 의존성 선언이 맞는지 검사하는 수단이다."
        },
        {
          id: "T-4",
          problem: "검증 도구가 통과했는데 아무것도 검사하지 않았다 (3회)",
          symptom: "검사 명령이 성공으로 끝났지만 대상이 0건이라 실제로는 아무 판정도 하지 않았다. 세 군데에서 같은 형태로 발견.",
          cause: "「위반 0건」과 「검사 대상 0건」이 같은 결과로 떨어지는 구조.",
          action: "0건 확인을 실패로 처리하도록 변경. 더해서 위반을 일부러 심고 롤백하는 자가검증 쿼리를 만들어, 검사가 그것을 실제로 잡는지 먼저 확인.",
          rule: "검사가 통과하면 「무엇이 통과했나」보다 「검사가 돌기는 했나」를 먼저 의심한다. 통과는 두 가지를 뜻할 수 있고 둘은 정반대다."
        },
        {
          id: "T-5",
          problem: "내가 쓴 문서의 사실관계가 틀렸고, 팀원 리뷰가 잡았다",
          symptom: "인프라 문서에 「암호화되지 않은 구간이 있었다」고 적었는데 팀원이 리뷰에서 시제를 지적.",
          cause: "커밋 이력을 확인하지 않고 현재 구성만 보고 과거형으로 썼다. 실제로는 해당 경로가 생긴 시점과 암호화가 적용된 시점이 같았다. 그 구간으로 평문 트래픽이 지난 적이 없다.",
          action: "커밋 이력으로 두 시점을 확인해 정정. 지우지 않고 회수 기록으로 남김.",
          rule: "문서도 코드와 같은 기준으로 근거를 댄다. 틀린 서술은 삭제가 아니라 회수로 처리한다. 무엇을 왜 잘못 알았는지가 남아야 같은 실수를 막는다."
        }
      ],
      screenshots: [holdfastImage, hfHarness, hfOversell, hfPageTiming, hfReqCoverage]
    }
  },
  {
    featured: true,
    title: "Smart Study Messenger — AWS 서버리스 실시간 메신저",
    description: "5인팀 백엔드 인프라 리드로 단독 설계한 AWS 서버리스 실시간 메신저. Lambda 35개·DynamoDB 7테이블, 트러블슈팅 6건 해결",
    tech: ["AWS Lambda", "API Gateway", "DynamoDB", "SQS", "Bedrock", "CloudWatch"],
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
        "Amazon CloudWatch (로그·지표)",
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
  {
    title: "ML 기반 Kubernetes 사전 오토스케일링 — 트래픽 Archetype별 예측 스케일러 평가",
    description: "KSCI 투고 예정 · 단독 집필. LSTM/GRU/앙상블 vs HPA 84회 실험, 리드타임 측정 도구 자체 개발로 'No Universal Winner' 실증",
    tech: ["Kubernetes", "HPA", "TensorFlow", "FastAPI", "LSTM/GRU", "Prometheus"],
    image: ksciImage1,
    github: "https://github.com/F3ZLoV/ML-based-Kubernetes-Pre-AutoScaling/tree/dev",
    notion: "",
    details: {
      overview: "Kubernetes 기본 오토스케일러 HPA의 사후 대응(reactive) 구조가 유발하는 cold start 지연을, ML 트래픽 예측 기반의 선제적(proactive) 스케일 아웃으로 해결·검증한 실증 연구. DigitalOcean Kubernetes(DOKS) 환경에서 External Metrics API로 LSTM·GRU·Ensemble 예측값을 스케일링 트리거로 연동하고, HPA와 함께 4개 트래픽 archetype(SPIKE·STATIONARY·RAMP·PERIODIC)을 포함한 7개 시나리오에서 총 84회(912 스케일링 이벤트)를 실측 비교. 특히 '스케일 명령 발행 → 새 파드 Ready 도달'까지의 리드 타임을 직접 측정하는 도구를 자체 개발해, 기존 연구가 놓친 운영 지표를 정량화. 결과적으로 단일 모델이 모든 패턴에서 우월하지 않다는 'No Universal Winner' 명제를 실측으로 도출(HPA 4승 / GRU 2승 / Ensemble 1승 / LSTM 0승)하고, GRU가 RAMP 시나리오에서 HPA 대비 리드 타임 15.1%·P95 지연 25.9% 개선을 달성함을 확인.",
      features: [
        "Kubernetes External Metrics API(metrics-api 트리거, targetValue=1)로 ML 추론 서버 예측값(predicted_replicas)을 스케일링 결정 입력으로 직접 연동",
        "Kubernetes Watch API 기반 리드 타임 측정 도구 자체 개발 (scale-out 명령 → pod condition.Ready 전환 시각 차이를 이벤트별 계측, CSV 로깅)",
        "7 시나리오 × 4 스케일러 × 3회 = 84 run 자동화 실험 파이프라인, 912건 스케일링 이벤트 분석 (리드타임·P95/P99·에러율·Time-to-Peak·Aggressiveness 5종 지표)",
        "실 트래픽 재현: AWS CloudWatch · Alibaba Cluster Trace 2018 · Wikimedia Pageview API를 Locust custom LoadShape로 리샘플링해 부하 발생",
        "2단계 Safety Guard: 규칙 기반 하한선 max(1, ⌊user_count/20⌋) + 통신 실패 시 last_known_traffic 폴백으로 무한 리셋 방지",
        "Alibaba Cluster Trace 2018로 LSTM/GRU 재학습(Colab T4), 60-step look-back window · 3-feature(user_count/rps/response_time) · MinMaxScaler 정규화",
        "ngrok HTTPS 터널로 로컬 FastAPI 추론 서버를 클러스터 External Metrics 소스로 노출"
      ],
      techStack: [
        "Kubernetes (DOKS)",
        "HPA",
        "Prometheus + Grafana",
        "Locust (custom LoadShape)",
        "FastAPI + Uvicorn",
        "TensorFlow 2.16 (LSTM/GRU/Ensemble)",
        "Python 3.12",
        "Kubernetes Watch API",
        "ngrok",
        "Alibaba Cluster Trace 2018"
      ],
      troubleshooting: [
        {
          problem: "초기 실험에서 모든 ML 모델이 HPA보다 리드 타임이 느리게 측정돼 'ML 오토스케일링은 실효성이 없다'는 잘못된 결론에 도달할 뻔함.",
          solution: "각 run 시작 시점의 클러스터 초기 상태(직전 실험의 미완료 스케일 다운으로 잔존한 파드)가 통제되지 않은 게 원인임을 데이터 분석으로 규명. 초기 상태 통제 프로토콜(kubectl delete hpa --all → replicas 리셋 → ScaledObject 재적용)을 도입하자 동일 archetype에서 결론이 반전 — GRU가 HPA 대비 리드 타임 15.1% 단축. ML 오토스케일러 평가에서 초기 상태 통제가 결과 신뢰성의 전제 조건임을 실증."
        },
        {
          problem: "AWS 데이터로 학습한 모델을 Alibaba 트래픽에 적용하자 Ensemble의 리드 타임이 2.57s → 4.67s(+81.7%)로 급락. 단순 가중 평균 결합이 분포 변화에 가장 취약했음.",
          solution: "LSTM·GRU 두 base 모델이 새 분포에 서로 다른 방향으로 적응할 때 그 차이가 가중 평균에서 증폭됨을 진단. Alibaba Cluster Trace 2018로 전면 재학습하고, 공개 데이터셋 단독 학습의 한계를 근거로 운영 데이터 기반 주기적 재학습 파이프라인의 필요성을 도출."
        },
        {
          problem: "Periodic 트래픽에서 Ensemble이 짧은 시간에 1개 → 25개 → 1개로 급진동(Δ≥20 대형 점프 11회)하며 replica churn 발생 → 클러스터 자원·비용 낭비.",
          solution: "LSTM·GRU 예측이 상충할 때 가중 평균이 불안정하게 진동하는 것이 원인임을 시계열 분석으로 규명(GRU는 동일 조건 0회, bounded). 단순 평균 결합에는 변화율 제한(rate limiting)·hysteresis 등 안정화 메커니즘이 필수임을 제시."
        },
        {
          problem: "기존 연구는 예측 정확도(RMSE/MAPE)만 평가해, 실제 운영 이득을 측정하지 못함. 실제로 LSTM은 Time-to-Peak가 가장 빨랐으나(57.6s) P95 지연은 8,000ms로 최악 — 확장 속도와 사용자 체감 성능이 비례하지 않음.",
          solution: "'scale-out 명령 → pod Ready'를 직접 계측하는 리드 타임 도구를 자체 개발하고, P95/P99 지연·에러율까지 5종 운영 메트릭으로 평가축을 재정의해 정확도-운영성능 간 단절을 실측으로 드러냄."
        }
      ],
      screenshots: [ksciImage1, ksciImage2, ksciImage3, ksciImage4, ksciImage5]
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
    title: "F1 레이싱 텔레메트리 데이터 파이프라인 구축",
    description: "FastF1 API로 2018–2025 시즌 F1 레이스 데이터(랩 타임, 텔레메트리, 날씨)를 수집해 MongoDB에 적재하는 ETL 파이프라인. 중단 지점부터 이어받는 선별 재수집으로 수십만 건 적재 안정성 확보",
    tech: ["Python", "MongoDB", "FastF1", "ETL"],
    image: f1ProjectImage,
    github: "https://github.com/F3ZLoV/BigDataProject_Formula1_Telemetry",
    notion: "",
    details: {
      overview: "FastF1 라이브러리로 연도별 전 경기 데이터를 수집해 MongoDB에 적재하는 배치 ETL 파이프라인. 랩 타임과 섹터 기록뿐 아니라 초당 수십 회 발생하는 차량 텔레메트리(속도, RPM, 기어, 스로틀)를 구조화해 저장한다. 수집량이 수십만 건 규모라 중단·부분 저장이 잦았고, 이를 처음부터 다시 받지 않고 누락분만 판별해 이어받는 복구 로직과 복합 인덱스 설계에 대부분의 시간을 썼다.",
      features: [
        "Smart Recovery Mode: 수집 중단 시 처음부터 다시 하지 않고, 메타데이터와 텔레메트리 데이터 유무를 확인해 누락된 세션만 선별 수집",
        "MongoDB 인덱싱 최적화: 연도/라운드/세션/드라이버 복합 인덱스를 적용하여 대용량 데이터 조회 속도 보장",
        "API 호출 안정성 확보: 랜덤 쿨다운(Sleep) 및 오류 발생 시 자동 재시도/로그 기록 시스템 구축"
      ],
      techStack: ["Python 3.11", "MongoDB", "PyMongo", "FastF1"],
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
    let isFirstPage = true

    for (const sectionKey of targetSections) {
      const sectionRef = sectionRefs[sectionKey].value

      let element = sectionRef?.querySelector('.a4-page')
      if (!element && sectionKey === 'projects') {
        element = sectionRef?.querySelector('.container')
      }
      if (!element) continue

      await waitForImages(element)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        imageTimeout: 15000,
        logging: false,
        backgroundColor: isDark.value ? '#1e293b' : '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')

      // 종횡비를 보존해 폭 기준으로 배치 (예전에는 A4 전면으로 늘려 찌그러졌음)
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (!isFirstPage) pdf.addPage()
      isFirstPage = false

      if (imgHeight <= pdfHeight + 1) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        // A4 한 장을 넘기는 섹션은 페이지 높이만큼 잘라 여러 장에 나눠 배치
        let offsetY = 0
        while (offsetY < imgHeight) {
          pdf.addImage(imgData, 'PNG', 0, -offsetY, imgWidth, imgHeight)
          offsetY += pdfHeight
          if (offsetY < imgHeight) pdf.addPage()
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

// --- 트러블슈팅 렌더링 ---
// steps가 있으면 그대로, 없으면 symptom/cause/action을 단계로 변환
const tsSteps = (ts) => {
  if (ts.steps) return ts.steps
  if (ts.symptom) {
    return [
      { label: '증상', text: ts.symptom },
      { label: '원인', text: ts.cause },
      { label: '조치', text: ts.action }
    ]
  }
  return null
}

const tsLabelClass = (label) => {
  if (['증상', '문제'].includes(label)) return 'text-red-600 dark:text-red-400'
  if (['원인', '영향'].includes(label)) return 'text-amber-600 dark:text-amber-400'
  if (['접근', '조치', '해결', '복구', '개선'].includes(label)) return 'text-green-600 dark:text-green-400'
  return 'text-muted-foreground'
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
        <div class="a4-page bg-background text-foreground p-10 flex flex-col gap-6 max-w-[794px] w-full min-h-[1123px] relative overflow-hidden mx-auto box-border rounded-sm">

          <div class="flex items-center justify-between border-b-2 border-foreground pb-4">
            <div class="space-y-2">
              <h1 class="text-4xl font-extrabold tracking-tight">박태준</h1>
              <p class="text-xl font-semibold text-muted-foreground">Infrastructure / System Engineer</p>
              <div class="pt-2 space-y-1 text-sm text-foreground/80">
                <p>리눅스 서버 운영과 장애 복구를 중심에 두고,<br/>클라우드·컨테이너 스택까지 이해하는 인프라 엔지니어</p>
                <p>온프레미스 3-Tier 구축 <span class="text-muted-foreground">— VM 7대, VIP 페일오버 1초 실측</span></p>
                <p>AWS 서버리스 백엔드 단독 설계 <span class="text-muted-foreground">— Lambda 35개·DynamoDB 7테이블</span></p>
              </div>
              <div class="flex flex-col gap-1 text-sm text-muted-foreground pt-2">
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
            <p class="text-sm leading-7 text-muted-foreground">
              Rocky Linux 9 VM 7대로 로드밸런서–웹–DB 3계층을 구축하고, HAProxy L7(HTTP) 로드밸런싱·헬스체크와 Keepalived VRRP VIP 페일오버로 이중화했습니다. MASTER 노드를 강제 종료해 다운타임 약 1초를 실측했고, PostgreSQL 스트리밍 복제·LVM 분리·Ansible 롤 코드화까지 구성했습니다. AWS 서버리스 백엔드를 5인 팀에서 단독 설계·운영했고, Kubernetes 오토스케일링을 84회 실험으로 검증해 KSCI에 투고 예정입니다.
            </p>
          </div>

          <div class="flex flex-col gap-6 flex-grow">
            <div>
              <h2 class="text-xl font-bold mb-2 uppercase border-l-4 border-foreground pl-3">Skills &amp; Tools</h2>
              <div class="grid grid-cols-2 gap-x-8 gap-y-3">
                <div v-for="group in skillGroups" :key="group.category">
                  <h3 class="text-sm font-bold text-muted-foreground mb-2">{{ group.category }}</h3>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                        v-for="skill in group.items"
                        :key="skill.name"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-xs font-semibold text-foreground whitespace-nowrap leading-none"
                    >
                      <img v-if="skill.icon" :src="skill.icon" class="w-3.5 h-3.5" :class="{ 'dark:invert': skill.invert }" alt="" />
                      <span>{{ skill.name }}</span>
                      <span
                          class="font-bold"
                          :class="skill.level === '중' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'"
                      >({{ skill.level }})</span>
                    </span>
                  </div>
                </div>
              </div>
              <p class="text-[11px] text-muted-foreground/70 mt-2">직접 설치·구성하고 장애를 겪어본 범위만 표기했습니다.</p>
            </div>

            <div class="grid grid-cols-2 gap-10">
              <div>
                <h2 class="text-xl font-bold mb-2 uppercase border-l-4 border-foreground pl-3">Education</h2>
                <div class="space-y-2">
                  <div class="relative pl-4 border-l-2 border-muted-foreground/20">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground"></div>
                    <h3 class="font-bold text-base">인하공업전문대학</h3>
                    <p class="text-sm font-medium text-muted-foreground">컴퓨터정보공학과 (공학사 · 4년제 과정)</p>
                    <p class="text-xs text-muted-foreground">2026.03 ~ 2027.02 (졸업예정)</p>
                  </div>
                  <div class="relative pl-4 border-l-2 border-muted-foreground/20">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground"></div>
                    <h3 class="font-bold text-base">인하공업전문대학</h3>
                    <p class="text-sm font-medium text-muted-foreground">컴퓨터정보공학과 (전문학사)</p>
                    <p class="text-xs text-muted-foreground">2020.03 ~ 2026.02</p>
                  </div>
                  <div class="relative pl-4 border-l-2 border-muted-foreground/20">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground"></div>
                    <h3 class="font-bold text-base">가좌고등학교</h3>
                    <p class="text-xs text-muted-foreground">~ 2020.02</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 class="text-xl font-bold mb-2 uppercase border-l-4 border-foreground pl-3">Certification</h2>
                <div class="border-t border-border pt-2">
                  <div class="border-b border-border pb-1.5">
                    <div class="flex justify-between items-baseline">
                      <span class="text-sm font-semibold text-foreground">정보처리기사</span>
                      <span class="text-sm text-muted-foreground">2026.09</span>
                    </div>
                    <p class="text-xs text-muted-foreground/70 mt-0.5">한국산업인력공단</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" :ref="sectionRefs.about" class="py-16 flex justify-center px-4">
        <div class="a4-page bg-background text-foreground p-10 flex flex-col gap-8 max-w-[794px] w-full min-h-[1123px] relative overflow-hidden mx-auto box-border rounded-sm">
          <div class="border-b border-border pb-4">
            <h2 class="text-3xl font-bold">About Me</h2>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              리눅스를 먼저 만났습니다
            </h3>
            <p class="text-sm leading-7 text-muted-foreground">
              전공 수업에서 리눅스 서버를 처음 다뤘습니다. 패키지를 설치하고 서비스를 올리고 로그를 읽는 순서를 그때 익혔습니다.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              클라우드를 쓰면서 밑단이 비어 있다는 걸 알았습니다
            </h3>
            <p class="text-sm leading-7 text-muted-foreground">
              이후 클라우드를 배우며 AWS 위에 여러 서비스를 올렸습니다. Lambda 35개와 DynamoDB 7테이블 규모의 서버리스 백엔드를 5인 팀에서 단독으로 설계·운영했습니다. 그런데 관리형 서비스가 대신 처리해주던 부분이 정확히 무엇인지 설명할 수 없었습니다. 로드밸런서가 어떻게 세션을 넘기는지, 복제가 어디서 깨지는지 모른 채 쓰고 있었습니다.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              그래서 직접 쌓아 올렸습니다
            </h3>
            <p class="text-sm leading-7 text-muted-foreground">
              Rocky Linux 9 VM 7대로 로드밸런서–웹–DB 3계층을 분리 구축했습니다. HAProxy L7 헬스체크로 백엔드를 자동 제외시키고, Keepalived VRRP로 VIP를 이중화하고, PostgreSQL 스트리밍 복제와 LVM 전용 볼륨을 붙였습니다. 전 구성은 Ansible 롤로 코드화해 단일 명령으로 재현됩니다. 이중화는 "구성했다"와 "실제로 넘어가는 것을 봤다"가 다릅니다. MASTER 노드를 강제 종료하고 1초 간격 curl 루프로 측정해서야 다운타임이 약 1초라는 것을 알 수 있었습니다.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <span class="w-2 h-8 bg-primary rounded-full inline-block"></span>
              로그를 따라 원인을 좁히는 일이 적성에 맞습니다
            </h3>
            <p class="text-sm leading-7 text-muted-foreground">
              설정은 정상인데 복제 접속이 계속 거부된 적이 있습니다. 인증 방식을 trust로, 주소를 0.0.0.0/0으로, 접속 출발지를 자기 자신으로 하나씩 바꿔 인증·범위·네트워크 세 계층을 배제하고 나서야 설정 파일 자체의 손상으로 원인을 특정했습니다. 고치고 끝내는 대신 재발 지점을 코드로 막습니다. 파괴적 task에는 멱등성 가드를 넣었고, 트러블슈팅은 증상 → 로그 확인 → 근본 원인 → 복구 절차 구조로 문서에 남깁니다.
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
                  <div v-if="project.period" class="flex flex-wrap items-center gap-2 mb-2">
                    <span class="text-xs text-muted-foreground">{{ project.period }}</span>
                    <span v-if="project.status" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">{{ project.status }}</span>
                  </div>
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
              신입 인프라 운영 엔지니어로 지원 중입니다. 채용 관련 연락을 환영합니다.
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
          <p>© 2026 Park Tae-joon. Created with Vue.js & Tailwind CSS.</p>
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
                <div v-if="selectedProject.period" class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="text-sm text-muted-foreground">{{ selectedProject.period }}</span>
                  <span v-if="selectedProject.status" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{{ selectedProject.status }}</span>
                </div>
                <div class="text-base flex flex-wrap gap-4 items-center mt-2 text-muted-foreground">
                  <a v-if="selectedProject.github" :href="selectedProject.github" target="_blank" class="flex items-center gap-1 hover:text-primary transition-colors">
                    <Github class="w-4 h-4" /> GitHub
                  </a>
                  <span v-if="selectedProject.github && selectedProject.notion" class="hidden md:inline">|</span>
                  <a v-if="selectedProject.notion" :href="selectedProject.notion" target="_blank" class="flex items-center gap-1 hover:text-primary transition-colors">
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

                      <!-- 라벨 있는 단계 구조 (사고 기록) -->
                      <template v-if="tsSteps(ts)">
                        <div class="flex items-baseline gap-2 mb-4 pb-3 border-b border-border/60">
                          <span v-if="ts.id" class="shrink-0 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">{{ ts.id }}</span>
                          <p class="font-bold">{{ ts.problem }}</p>
                        </div>
                        <dl class="space-y-3 text-sm">
                          <div v-for="step in tsSteps(ts)" :key="step.label" class="grid grid-cols-[3.5rem_1fr] gap-x-3">
                            <dt class="text-xs font-bold pt-0.5" :class="tsLabelClass(step.label)">{{ step.label }}</dt>
                            <dd class="text-muted-foreground leading-relaxed">{{ step.text }}</dd>
                          </div>
                          <div v-if="ts.rule" class="grid grid-cols-[3.5rem_1fr] gap-x-3 pt-2 border-t border-border/50">
                            <dt class="text-xs font-bold text-primary pt-0.5">{{ ts.ruleLabel || '규칙' }}</dt>
                            <dd class="font-medium leading-relaxed">{{ ts.rule }}</dd>
                          </div>
                        </dl>
                        <pre v-if="ts.code" class="mt-4 p-3 rounded-md bg-slate-900 text-slate-100 text-xs leading-relaxed overflow-x-auto"><code>{{ ts.code }}</code></pre>
                      </template>

                      <!-- 기존 Problem / Solution 구조 -->
                      <template v-else>
                        <div class="mb-3">
                          <span class="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">Problem</span>
                          <p class="font-medium">{{ ts.problem }}</p>
                        </div>
                        <div class="pl-2 border-l-2 border-green-500/50">
                          <span class="inline-block bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded mb-1">Solution</span>
                          <p class="text-sm text-muted-foreground leading-relaxed">{{ ts.solution }}</p>
                          <pre v-if="ts.code" class="mt-3 p-3 rounded-md bg-slate-900 text-slate-100 text-xs leading-relaxed overflow-x-auto"><code>{{ ts.code }}</code></pre>
                        </div>
                      </template>
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
  /* 한글이 어절 중간에서 끊기지 않도록 (예: "약 1 / 초") */
  word-break: keep-all;
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