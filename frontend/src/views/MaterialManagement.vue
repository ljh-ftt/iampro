<template>
  <div class="material-management-container">
    <van-nav-bar title="物资管理" left-text="返回" @click-left="goBack">
      <template #title>
        <div style="display: flex; align-items: center;">
          <van-icon name="shopping-cart-o" style="margin-right: 8px;" />
          物资管理
        </div>
      </template>
    </van-nav-bar>
    
    <van-tabs v-model="activeTab">
      <van-tab v-if="!isSuperAdmin" title="物资入库">
        <van-form @submit="onStockIn">
          <van-field
            v-model="stockInForm.name"
            name="name"
            placeholder="请输入物资名称"
            label="物资名称"
            required
            :rules="[{ required: true, message: '请输入物资名称' }]"
          />
          <van-field
            v-model="stockInForm.type"
            name="type"
            placeholder="请输入物资类型"
            label="物资类型"
            required
            :rules="[{ required: true, message: '请输入物资类型' }]"
          />
          <van-field
            v-model="stockInForm.unit"
            name="unit"
            placeholder="请输入计量单位"
            label="计量单位"
            required
            :rules="[{ required: true, message: '请输入计量单位' }]"
          />
          <van-field
            v-model="stockInForm.quantity"
            name="quantity"
            type="number"
            placeholder="请输入入库数量"
            label="入库数量"
            required
            :rules="[{ required: true, message: '请输入入库数量' }]"
          />
          <van-field
            v-model="stockInForm.min_stock"
            name="min_stock"
            type="number"
            placeholder="请输入最小库存"
            label="最小库存"
          />
          <van-field
            v-model="stockInForm.category"
            name="category"
            label="物资分类"
            readonly
            clickable
            @click="showCategoryPicker = true"
            :rules="[{ required: true, message: '请选择物资分类' }]"
          >
            <template #input>
              <van-tag :type="stockInForm.category === 'production' ? 'primary' : 'success'">
                {{ stockInForm.category === 'production' ? '生产性物资' : '非生产性物资' }}
              </van-tag>
            </template>
          </van-field>
          
          <!-- 物资分类选择器 -->
          <van-popup
            v-model="showCategoryPicker"
            position="bottom"
            round
          >
            <div class="picker-container">
              <div class="picker-header">
                <van-button type="default" size="small" @click="showCategoryPicker = false">取消</van-button>
                <span class="picker-title">请选择物资分类</span>
                <van-button type="primary" size="small" @click="confirmCategorySelection">确定</van-button>
              </div>
              <van-picker
                ref="categoryPicker"
                :columns="categoryOptions"
                @change="onCategoryChange"
              />
            </div>
          </van-popup>
          
          <div style="margin: 24px;">
            <van-button type="primary" block native-type="submit" :loading="loading">
              入库
            </van-button>
          </div>
        </van-form>
      </van-tab>
      <van-tab v-if="!isSuperAdmin" title="物资出库">
        <van-form @submit="onStockOut">
          <van-field
            v-model="stockOutForm.material_id"
            name="material_id"
            placeholder="请输入物资ID"
            label="物资ID"
            required
            :rules="[{ required: true, message: '请输入物资ID' }]"
          />
          <van-field
            v-model="stockOutForm.quantity"
            name="quantity"
            type="number"
            placeholder="请输入出库数量"
            label="出库数量"
            required
            :rules="[{ required: true, message: '请输入出库数量' }]"
          />
          <van-field
            v-model="stockOutForm.user_id"
            name="user_id"
            placeholder="请输入领取人ID"
            label="领取人ID"
            required
            :rules="[{ required: true, message: '请输入领取人ID' }]"
          />
          
          <div style="margin: 24px;">
            <van-button type="primary" block native-type="submit" :loading="loading">
              出库
            </van-button>
          </div>
        </van-form>
      </van-tab>
      <van-tab title="物资列表">
        <!-- 搜索和筛选区域 -->
        <div class="search-container">
          <van-search
            v-model="searchKeyword"
            placeholder="请输入物资名称搜索"
            @search="onSearch"
            @clear="onClear"
          />
          <div class="filter-container">
            <van-dropdown-menu>
              <van-dropdown-item
                v-model="filterCategory"
                :options="categoryFilterOptions"
                @change="onCategoryFilter"
              />
            </van-dropdown-menu>
          </div>
        </div>
        
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          :immediate-check="false"
        >
          <van-cell
            v-for="item in materials"
            :key="item.id"
            :title="item.name"
            :value="`库存：${item.stock_quantity}${item.unit}`"
          >
            <template #label>
              <div>
                <div>{{ item.name }}</div>
                <div style="font-size: 12px; color: #999;">
                  {{ `类型：${item.type} | 单位：${item.unit} | 分类：${item.category === 'production' ? '生产性物资' : '非生产性物资'}` }}
                </div>
              </div>
            </template>
            <template #right-icon>
              <van-tag :type="item.stock_quantity <= item.min_stock ? 'danger' : 'success'">
                {{ item.stock_quantity <= item.min_stock ? '库存不足' : '正常' }}
              </van-tag>
            </template>
          </van-cell>
        </van-list>
      </van-tab>
      <van-tab v-if="!isSuperAdmin" title="申领审批">
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoadRequests"
          :immediate-check="false"
        >
          <van-cell
            v-for="item in pendingRequests"
            :key="item.id"
            :title="`物资：${item.Material?.name}`"
            :value="`状态：待审批`"
          >
            <template #label>
              <div>
                <div>{{ `物资：${item.Material?.name}` }}</div>
                <div style="font-size: 12px; color: #999;">
                  {{ `申请人：${item.requester?.name} | 数量：${item.request_quantity}${item.Material?.unit || ''}` }}
                </div>
              </div>
            </template>
            <template #right-icon>
              <div class="btn-group">
                <van-button size="small" type="primary" @click="approveRequest(item, 'approved')">
                  批准
                </van-button>
                <van-button size="small" type="danger" @click="approveRequest(item, 'rejected')">
                  拒绝
                </van-button>
              </div>
            </template>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { addMaterial, issueMaterial, getMaterials, getMaterialRequests, approveMaterialRequest } from '../api/material'
import { Toast, Icon } from 'vant'
import { mapGetters } from 'vuex'

export default {
  name: 'MaterialManagement',
  components: {
    Icon
  },
  data() {
    return {
      activeTab: 0,
      
      stockInForm: {
        name: '',
        type: '',
        unit: '',
        quantity: '',
        min_stock: '',
        category: 'production' // 默认是生产性物资
      },
      
      stockOutForm: {
        material_id: '',
        quantity: '',
        user_id: ''
      },
      
      materials: [],
      pendingRequests: [],
      loading: false,
      finished: false,
      page: 1,
      // 搜索相关
      searchKeyword: '',
      filterCategory: '', // '' 表示全部，'production' 表示生产性，'non_production' 表示非生产性
      // 物资分类选择相关
      showCategoryPicker: false,
      categoryOptions: [
        { text: '生产性物资', value: 'production' },
        { text: '非生产性物资', value: 'non_production' }
      ],
      categoryFilterOptions: [
        { text: '全部分类', value: '' },
        { text: '生产性物资', value: 'production' },
        { text: '非生产性物资', value: 'non_production' }
      ],
      selectedCategoryIndex: 0
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userRole']),
    isSuperAdmin() {
      return this.userRole === 'super_admin'
    }
  },
  mounted() {
    if (this.activeTab === 2) {
      this.onLoad()
    } else if (this.activeTab === 3) {
      this.onLoadRequests()
    }
  },
  methods: {
    async onStockIn(values) {
      try {
        this.loading = true
        await addMaterial({
          name: this.stockInForm.name,
          type: this.stockInForm.type,
          unit: this.stockInForm.unit,
          quantity: parseInt(this.stockInForm.quantity),
          min_stock: parseInt(this.stockInForm.min_stock) || 0,
          category: this.stockInForm.category
        })
        
        Toast.success('物资入库成功')
        
        // 重置表单
        this.stockInForm = {
          name: '',
          type: '',
          unit: '',
          quantity: '',
          min_stock: ''
        }
        
        // 切换到物资列表标签
        this.activeTab = 2
      } catch (error) {
        console.error(error)
        Toast.fail(error.response?.data?.message || '物资入库失败')
      } finally {
        this.loading = false
      }
    },
    
    async onStockOut(values) {
      try {
        this.loading = true
        await issueMaterial({
          material_id: parseInt(this.stockOutForm.material_id),
          quantity: parseInt(this.stockOutForm.quantity),
          user_id: parseInt(this.stockOutForm.user_id)
        })
        
        Toast.success('物资出库成功')
        
        // 重置表单
        this.stockOutForm = {
          material_id: '',
          quantity: '',
          user_id: ''
        }
        
        // 切换到物资列表标签
        this.activeTab = 2
      } catch (error) {
        console.error(error)
        Toast.fail(error.response?.data?.message || '物资出库失败')
      } finally {
        this.loading = false
      }
    },
    
    async onLoad() {
      try {
        this.loading = true
        const params = {
          page: this.page,
          category: this.filterCategory || undefined,
          search: this.searchKeyword || undefined
        }
        
        const response = await getMaterials(params)
        const data = response.data
        
        if (this.page === 1) {
          this.materials = data
        } else {
          this.materials = [...this.materials, ...data]
        }
        
        this.finished = data.length < 10
        this.page++
      } catch (error) {
        console.error(error)
        Toast.fail('获取物资列表失败')
      } finally {
        this.loading = false
      }
    },
    
    async onLoadRequests() {
      try {
        this.loading = true
        const response = await getMaterialRequests({ status: 'pending' })
        this.pendingRequests = response.data
        this.finished = true
      } catch (error) {
        console.error(error)
        Toast.fail('获取申领记录失败')
      } finally {
        this.loading = false
      }
    },
    
    async approveRequest(request, status) {
      try {
        await approveMaterialRequest({
          id: request.id,
          status
        })
        
        Toast.success(`已${status === 'approved' ? '批准' : '拒绝'}申领`)
        
        // 刷新申领审批列表
        this.onLoadRequests()
      } catch (error) {
        console.error(error)
        Toast.fail('审批失败')
      }
    },
    goBack() {
      // 使用更可靠的导航方式，先尝试返回，如果失败则导航到首页
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/home')
      }
    },
    
    // 物资分类选择器确认事件
    onCategoryConfirm(value, index) {
      this.stockInForm.category = value.value
      this.showCategoryPicker = false
    },
    
    // 物资分类变化事件
    onCategoryChange(picker, value, index) {
      this.selectedCategoryIndex = index
    },
    
    // 确认分类选择
    confirmCategorySelection() {
      const selectedOption = this.categoryOptions[this.selectedCategoryIndex]
      this.stockInForm.category = selectedOption.value
      this.showCategoryPicker = false
    },

    // 搜索功能实现
    onSearch() {
      this.page = 1
      this.materials = []
      this.finished = false
      this.onLoad()
    },
    
    // 清除搜索
    onClear() {
      this.searchKeyword = ''
      this.page = 1
      this.materials = []
      this.finished = false
      this.onLoad()
    },
    
    // 分类筛选
    onCategoryFilter() {
      this.page = 1
      this.materials = []
      this.finished = false
      this.onLoad()
    }
  },
  watch: {
    activeTab(newTab) {
      this.page = 1
      this.finished = false
      if (newTab === 2) {
        this.materials = []
        this.onLoad()
      } else if (newTab === 3) {
        this.pendingRequests = []
        this.onLoadRequests()
      }
    }
  }
}
</script>

<style scoped>
.material-management-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.picker-container {
  background-color: #fff;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
}

.search-container {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.filter-container {
  margin-top: 12px;
}

.search-container .van-search {
  padding: 0;
}

.search-container .van-dropdown-menu {
  height: 36px;
}

.search-container .van-dropdown-menu__bar {
  height: 36px;
  box-shadow: none;
  border: 1px solid #ebedf0;
  border-radius: 6px;
}
</style>
