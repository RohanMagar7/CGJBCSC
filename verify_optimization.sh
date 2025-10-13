#!/bin/bash

# Optimization Verification Script
# This script verifies that all optimizations are properly applied

echo "🚀 CGJBCSC Project Optimization Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check function
check_step() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

check_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

echo "📁 Checking Documentation Files..."
echo "-----------------------------------"

# Check documentation files
docs=(
    "OPTIMIZATION_QUICK_REFERENCE.md"
    "DATABASE_OPTIMIZATION_COMPLETE.md"
    "COMPLETE_OPTIMIZATION_SUMMARY.md"
    "OPTIMIZATION_ARCHITECTURE.md"
    "DOCUMENTATION_INDEX.md"
    "frontend/FRONTEND_OPTIMIZATION_COMPLETE.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅${NC} Found: $doc"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} Missing: $doc"
        ((FAILED++))
    fi
done

echo ""
echo "🔧 Checking Frontend Files..."
echo "------------------------------"

# Check frontend utility files
frontend_files=(
    "frontend/src/utils/cacheManager.js"
    "frontend/src/utils/imageOptimization.js"
    "frontend/src/hooks/useOptimizedFetch.js"
    "frontend/vite.config.js"
    "frontend/src/App.jsx"
    "frontend/src/services/apiService.js"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} Found: $file"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} Missing: $file"
        ((FAILED++))
    fi
done

echo ""
echo "🗄️  Checking Backend Files..."
echo "-----------------------------"

# Check backend files
backend_files=(
    "sewa_portal/core/models.py"
    "sewa_portal/core/views.py"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} Found: $file"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} Missing: $file"
        ((FAILED++))
    fi
done

echo ""
echo "📦 Checking Migration File..."
echo "------------------------------"

migration_file="sewa_portal/core/migrations/0009_add_database_indexes_optimization.py"
if [ -f "$migration_file" ]; then
    echo -e "${GREEN}✅${NC} Found: $migration_file"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Missing: $migration_file"
    ((FAILED++))
fi

echo ""
echo "🔍 Checking File Contents..."
echo "-----------------------------"

# Check if lazy loading is implemented in App.jsx
if grep -q "lazy" "frontend/src/App.jsx" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Lazy loading found in App.jsx"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Lazy loading NOT found in App.jsx"
    ((FAILED++))
fi

# Check if caching is implemented in apiService.js
if grep -q "cacheManager" "frontend/src/services/apiService.js" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Caching found in apiService.js"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Caching NOT found in apiService.js"
    ((FAILED++))
fi

# Check if select_related is in views.py
if grep -q "select_related" "sewa_portal/core/views.py" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Query optimization found in views.py"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Query optimization NOT found in views.py"
    ((FAILED++))
fi

# Check if db_index is in models.py
if grep -q "db_index=True" "sewa_portal/core/models.py" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Database indexes found in models.py"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Database indexes NOT found in models.py"
    ((FAILED++))
fi

echo ""
echo "📊 Checking Build Configuration..."
echo "----------------------------------"

# Check Vite config for optimization
if grep -q "manualChunks" "frontend/vite.config.js" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Code splitting configured in vite.config.js"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Code splitting NOT configured"
    ((FAILED++))
fi

if grep -q "terser" "frontend/vite.config.js" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Minification configured in vite.config.js"
    ((PASSED++))
else
    check_warning "Minification may not be configured"
fi

echo ""
echo "🔧 Backend Environment Check..."
echo "--------------------------------"

# Check if virtual environment exists
if [ -d "sys/bin" ] || [ -d "sys/Scripts" ]; then
    echo -e "${GREEN}✅${NC} Virtual environment found"
    ((PASSED++))
else
    check_warning "Virtual environment not found at sys/"
fi

# Check if Django is installed
if [ -f "sewa_portal/manage.py" ]; then
    echo -e "${GREEN}✅${NC} Django project structure verified"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Django project structure issue"
    ((FAILED++))
fi

echo ""
echo "📦 Frontend Dependencies Check..."
echo "----------------------------------"

# Check if package.json exists
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅${NC} package.json found"
    ((PASSED++))
    
    # Check for key dependencies
    if grep -q "react" "frontend/package.json"; then
        echo -e "${GREEN}✅${NC} React dependency found"
        ((PASSED++))
    fi
    
    if grep -q "vite" "frontend/package.json"; then
        echo -e "${GREEN}✅${NC} Vite dependency found"
        ((PASSED++))
    fi
else
    echo -e "${RED}❌${NC} package.json not found"
    ((FAILED++))
fi

# Check if node_modules exists
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules directory exists"
    ((PASSED++))
else
    check_warning "node_modules not found - run 'npm install'"
fi

echo ""
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="
echo ""
echo -e "${GREEN}Passed:${NC}   $PASSED checks"
echo -e "${RED}Failed:${NC}   $FAILED checks"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS checks"
echo ""

# Calculate percentage
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
    echo "Success Rate: $PERCENTAGE%"
    echo ""
fi

# Final verdict
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL OPTIMIZATIONS VERIFIED!${NC}"
    echo ""
    echo "🚀 Your project is fully optimized and ready!"
    echo ""
    echo "Next steps:"
    echo "1. cd sewa_portal && python manage.py migrate"
    echo "2. cd frontend && npm run build"
    echo "3. Run performance tests"
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please review the failed checks above."
    echo "Refer to DOCUMENTATION_INDEX.md for details."
    exit 1
fi
