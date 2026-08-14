#!/usr/bin/env bash
# App 检测工具 —— 一键解析已签名 APK / AAB 的：
#   包名 / 应用名 / 图标 / 公钥 / 证书 MD5 指纹
#
# 用法：
#   ./scripts/apk-inspect.sh <path/to/app.apk>
#
# 依赖（任选其一，二选一即可拿到证书信息）：
#   - JDK 自带 keytool
#   - Android SDK build-tools 提供 aapt / apksigner
# 可用环境变量覆盖：
#   AAPT=/path/to/aapt   APKSIGNER=/path/to/apksigner   KEYTOOL=/path/to/keytool
set -euo pipefail

APK="${1:-}"
if [[ -z "$APK" || ! -f "$APK" ]]; then
  echo "用法: $0 <apk 或 aab 路径>" >&2
  exit 1
fi

# ---- 定位工具 ---------------------------------------------------------------
command -v "${KEYTOOL:-keytool}" >/dev/null && KEYTOOL_BIN="${KEYTOOL:-keytool}" || KEYTOOL_BIN=""
if [[ -z "$KEYTOOL_BIN" ]]; then
  echo "!! 未找到 keytool，请安装 JDK 或设置 KEYTOOL 环境变量" >&2
fi

if [[ -z "${AAPT:-}" ]]; then
  # 在常见 build-tools 路径里找 aapt2 / aapt
  for cand in \
    "$ANDROID_HOME"/build-tools/*/aapt2 \
    "$ANDROID_SDK_ROOT"/build-tools/*/aapt2 \
    "$ANDROID_HOME"/build-tools/*/aapt \
    "$ANDROID_SDK_ROOT"/build-tools/*/aapt; do
    if [[ -x "$cand" ]]; then AAPT="$cand"; break; fi
  done
fi

if [[ -z "${APKSIGNER:-}" ]]; then
  for cand in \
    "$ANDROID_HOME"/build-tools/*/apksigner \
    "$ANDROID_SDK_ROOT"/build-tools/*/apksigner; do
    if [[ -x "$cand" ]]; then APKSIGNER="$cand"; break; fi
    # apksigner 是脚本，需要 lib/apksigner.jar
    if [[ -f "$cand" ]]; then APKSIGNER="$cand"; break; fi
  done
fi

OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

echo "================================================================"
echo " APK 检测报告:  $APK"
echo "================================================================"

# ---- 1) 包名 / 应用名 / 图标路径 --------------------------------------------
PKG=""; LABEL=""; ICON_PATH=""
if [[ -n "${AAPT:-}" ]]; then
  BADGE="$("$AAPT" dump badging "$APK" 2>/dev/null || true)"
  PKG="$(echo "$BADGE" | sed -n "s/^package: name='\([^']*\).*/\1/p" | head -1)"
  LABEL="$(echo "$BADGE" | sed -n "s/^application-label:\(.*\)/\1/p" | tr -d "'" | head -1)"
  ICON_PATH="$(echo "$BADGE" | sed -n "s/^application-icon-.*:'\([^']*\)'.*/\1/p" | tail -1)"
fi
# aapt 拿不到时，退化从文件名/manifest 猜包名
if [[ -z "$PKG" ]]; then PKG="(需 aapt 解析)"; fi

echo ">> 包名 (package)      : $PKG"
echo ">> 应用名 (label)       : $LABEL"
echo ">> 图标资源路径         : ${ICON_PATH:-(需 aapt 解析)}"

# ---- 2) 提取图标 PNG 到本地 -------------------------------------------------
if [[ -n "$ICON_PATH" ]]; then
  ICON_OUT="$OUT/icon.png"
  # APK 是 zip，直接 unzip 单个条目
  if unzip -o -q "$APK" "$ICON_PATH" -d "$OUT" 2>/dev/null; then
    cp "$OUT/$ICON_PATH" "$ICON_OUT" 2>/dev/null || true
    echo ">> 图标已导出           : $ICON_OUT"
  fi
fi

# ---- 3) 公钥 + 证书指纹 -----------------------------------------------------
echo
echo "---- 证书 / 公钥（keytool -printcert） ----"
if [[ -n "$KEYTOOL_BIN" ]]; then
  "$KEYTOOL_BIN" -printcert -jarfile "$APK" 2>/dev/null || \
    echo "（v2/v3 签名，keytool 读不到，见下方 apksigner）"
else
  echo "!! 缺少 keytool"
fi

echo
echo "---- 签名信息（apksigner，含 v2/v3） ----"
if [[ -n "${APKSIGNER:-}" ]]; then
  "$APKSIGNER" verify --print-certs --verbose "$APK" 2>/dev/null || \
    echo "!! apksigner 运行失败：$APKSIGNER"
else
  echo "（未找到 apksigner，跳过。它在 Android SDK build-tools 下）"
fi

echo "================================================================"
